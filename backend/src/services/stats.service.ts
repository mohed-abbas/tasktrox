import { prisma } from '../config/database.js';
import { redis, CACHE_KEYS, CACHE_TTL } from '../config/redis.js';

// Types
export interface TaskStats {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  projectBreakdown: {
    projectId: string;
    projectName: string;
    taskCount: number;
    completedCount: number;
    completionRate: number;
  }[];
}

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: string | null;
  projectId: string;
  projectName: string;
  columnName: string;
}

export interface RecentActivityItem {
  id: string;
  action: string;
  taskId: string | null;
  projectId: string;
  projectName: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardStats {
  tasks: TaskStats;
  projects: ProjectStats;
  upcomingTasks: UpcomingTask[];
  recentActivity: RecentActivityItem[];
}

export interface SingleProjectStats {
  tasks: TaskStats;
  upcomingTasks: UpcomingTask[];
  recentActivity: RecentActivityItem[];
}

export class StatsService {
  /**
   * Get dashboard stats for a user
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    const cacheKey = `${CACHE_KEYS.USER_STATS}:${userId}`;

    // Try cache first
    const cached = await redis?.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get user's project IDs
    const userProjects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true, project: { select: { name: true } } },
    });
    const projectIds = userProjects.map((p) => p.projectId);

    // Run queries in parallel
    const [taskStats, projectStats, upcomingTasks, recentActivity] = await Promise.all([
      this.getTaskStats(projectIds),
      this.getProjectStatsData(userId, projectIds, userProjects),
      this.getUpcomingTasks(projectIds),
      this.getRecentActivity(projectIds),
    ]);

    const stats: DashboardStats = {
      tasks: taskStats,
      projects: projectStats,
      upcomingTasks,
      recentActivity,
    };

    // Cache for 5 minutes
    await redis?.setex(cacheKey, CACHE_TTL.USER_STATS, JSON.stringify(stats));

    return stats;
  }

  /**
   * Get task statistics across projects
   */
  private static async getTaskStats(projectIds: string[]): Promise<TaskStats> {
    if (projectIds.length === 0) {
      return { total: 0, completed: 0, inProgress: 0, overdue: 0 };
    }

    const now = new Date();

    // Get all columns for these projects to identify "done" columns
    const columns = await prisma.column.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true, name: true },
    });

    const doneColumnIds = columns
      .filter((c) => c.name.toLowerCase().includes('done'))
      .map((c) => c.id);
    const inProgressColumnIds = columns
      .filter((c) => c.name.toLowerCase().includes('progress'))
      .map((c) => c.id);
    const notDoneColumnIds = columns
      .filter((c) => !c.name.toLowerCase().includes('done'))
      .map((c) => c.id);

    const [total, completed, inProgress, overdue] = await Promise.all([
      // Total tasks
      prisma.task.count({
        where: {
          column: { projectId: { in: projectIds } },
        },
      }),
      // Completed tasks
      prisma.task.count({
        where: {
          columnId: { in: doneColumnIds },
        },
      }),
      // In progress tasks
      prisma.task.count({
        where: {
          columnId: { in: inProgressColumnIds },
        },
      }),
      // Overdue tasks (not done, past due date)
      prisma.task.count({
        where: {
          columnId: { in: notDoneColumnIds },
          dueDate: { lt: now },
        },
      }),
    ]);

    return { total, completed, inProgress, overdue };
  }

  /**
   * Get project statistics
   */
  private static async getProjectStatsData(
    _userId: string,
    projectIds: string[],
    userProjects: { projectId: string; project: { name: string } }[]
  ): Promise<ProjectStats> {
    if (projectIds.length === 0) {
      return { totalProjects: 0, activeProjects: 0, projectBreakdown: [] };
    }

    const projectBreakdown = await Promise.all(
      userProjects.map(async ({ projectId, project }) => {
        // Get done column IDs for this project
        const doneColumns = await prisma.column.findMany({
          where: {
            projectId,
            name: { contains: 'Done' },
          },
          select: { id: true },
        });
        const doneColumnIds = doneColumns.map((c) => c.id);

        const [taskCount, completedCount] = await Promise.all([
          prisma.task.count({
            where: { column: { projectId } },
          }),
          prisma.task.count({
            where: {
              columnId: { in: doneColumnIds },
            },
          }),
        ]);

        return {
          projectId,
          projectName: project.name,
          taskCount,
          completedCount,
          completionRate: taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0,
        };
      })
    );

    // Active projects are those with at least one incomplete task
    const activeCount = projectBreakdown.filter(
      (p) => p.taskCount > p.completedCount || p.taskCount === 0
    ).length;

    return {
      totalProjects: projectIds.length,
      activeProjects: activeCount,
      projectBreakdown,
    };
  }

  /**
   * Get upcoming tasks (due within 7 days)
   */
  private static async getUpcomingTasks(projectIds: string[]): Promise<UpcomingTask[]> {
    if (projectIds.length === 0) {
      return [];
    }

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get columns that are NOT done columns
    const notDoneColumns = await prisma.column.findMany({
      where: {
        projectId: { in: projectIds },
        NOT: { name: { contains: 'Done' } },
      },
      select: { id: true },
    });
    const notDoneColumnIds = notDoneColumns.map((c) => c.id);

    const tasks = await prisma.task.findMany({
      where: {
        columnId: { in: notDoneColumnIds },
        dueDate: {
          gte: now,
          lte: weekFromNow,
        },
      },
      include: {
        column: {
          select: {
            name: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate!.toISOString(),
      priority: task.priority,
      projectId: task.column.project.id,
      projectName: task.column.project.name,
      columnName: task.column.name,
    }));
  }

  /**
   * Get recent activity across projects
   */
  private static async getRecentActivity(projectIds: string[]): Promise<RecentActivityItem[]> {
    if (projectIds.length === 0) {
      return [];
    }

    const activities = await prisma.activity.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      taskId: activity.taskId,
      projectId: activity.projectId,
      projectName: activity.project.name,
      metadata: activity.metadata as Record<string, unknown> | null,
      createdAt: activity.createdAt.toISOString(),
    }));
  }

  /**
   * Get stats for a specific project
   */
  static async getProjectStats(projectId: string): Promise<SingleProjectStats> {
    const cacheKey = `${CACHE_KEYS.PROJECT_STATS}:${projectId}`;

    // Try cache first
    const cached = await redis?.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const [taskStats, upcomingTasks, recentActivity] = await Promise.all([
      this.getTaskStats([projectId]),
      this.getUpcomingTasks([projectId]),
      this.getRecentActivity([projectId]),
    ]);

    const stats: SingleProjectStats = {
      tasks: taskStats,
      upcomingTasks,
      recentActivity,
    };

    // Cache for 2 minutes
    await redis?.setex(cacheKey, 120, JSON.stringify(stats));

    return stats;
  }

  /**
   * Invalidate stats cache for a user
   */
  static async invalidateUserStats(userId: string): Promise<void> {
    const cacheKey = `${CACHE_KEYS.USER_STATS}:${userId}`;
    await redis?.del(cacheKey);
  }

  /**
   * Invalidate stats cache for a project
   */
  static async invalidateProjectStats(projectId: string): Promise<void> {
    const cacheKey = `${CACHE_KEYS.PROJECT_STATS}:${projectId}`;
    await redis?.del(cacheKey);
  }
}
