import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';

// Types
export interface TasksOverTimeData {
  date: string;
  created: number;
  completed: number;
}

export interface TasksByStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface TasksByAssigneeData {
  userId: string;
  userName: string;
  avatar: string | null;
  total: number;
  completed: number;
  inProgress: number;
}

export interface TasksByPriorityData {
  priority: string;
  count: number;
  percentage: number;
}

export interface CompletionMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number | null; // in days
  overdueRate: number;
  tasksCompletedThisWeek: number;
  tasksCompletedLastWeek: number;
  weekOverWeekChange: number;
}

export class ReportsService {
  /**
   * Get tasks created and completed over time
   */
  static async getTasksOverTime(
    projectId: string,
    days: number = 30
  ): Promise<TasksOverTimeData[]> {
    const cacheKey = `reports:tasks-over-time:${projectId}:${days}`;
    const cached = await redis?.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all tasks for this project created in the time range
    const tasks = await prisma.task.findMany({
      where: {
        column: { projectId },
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        createdAt: true,
        column: {
          select: { name: true },
        },
      },
    });

    // Get activities for completed tasks
    const completedActivities = await prisma.activity.findMany({
      where: {
        projectId,
        action: 'task.completed',
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
    });

    // Build daily aggregation
    const dailyData: Map<string, { created: number; completed: number }> = new Map();

    // Initialize all days
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0] as string;
      dailyData.set(dateStr, { created: 0, completed: 0 });
    }

    // Count created tasks
    for (const task of tasks) {
      const dateStr = task.createdAt.toISOString().split('T')[0] as string;
      const existing = dailyData.get(dateStr);
      if (existing) {
        existing.created++;
      }
    }

    // Count completed tasks
    for (const activity of completedActivities) {
      const dateStr = activity.createdAt.toISOString().split('T')[0] as string;
      const existing = dailyData.get(dateStr);
      if (existing) {
        existing.completed++;
      }
    }

    const result = Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        created: data.created,
        completed: data.completed,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Cache for 5 minutes
    await redis?.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  /**
   * Get tasks grouped by status (column)
   */
  static async getTasksByStatus(projectId: string): Promise<TasksByStatusData[]> {
    const cacheKey = `reports:tasks-by-status:${projectId}`;
    const cached = await redis?.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const columns = await prisma.column.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    const totalTasks = columns.reduce((sum, col) => sum + col._count.tasks, 0);

    const result = columns.map((col) => ({
      status: col.name,
      count: col._count.tasks,
      percentage: totalTasks > 0 ? Math.round((col._count.tasks / totalTasks) * 100) : 0,
    }));

    // Cache for 5 minutes
    await redis?.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  /**
   * Get tasks grouped by assignee
   */
  static async getTasksByAssignee(projectId: string): Promise<TasksByAssigneeData[]> {
    const cacheKey = `reports:tasks-by-assignee:${projectId}`;
    const cached = await redis?.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get all columns to identify "done" columns
    const columns = await prisma.column.findMany({
      where: { projectId },
      select: { id: true, name: true },
    });
    const doneColumnIds = columns
      .filter((c) => c.name.toLowerCase().includes('done'))
      .map((c) => c.id);
    const inProgressColumnIds = columns
      .filter((c) => c.name.toLowerCase().includes('progress'))
      .map((c) => c.id);

    // Get assignees with task counts
    const assignees = await prisma.taskAssignee.findMany({
      where: {
        task: {
          column: { projectId },
        },
      },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        task: {
          select: {
            columnId: true,
          },
        },
      },
    });

    // Aggregate by user
    const userMap: Map<
      string,
      { userName: string; avatar: string | null; total: number; completed: number; inProgress: number }
    > = new Map();

    for (const assignment of assignees) {
      const existing = userMap.get(assignment.userId) || {
        userName: assignment.user.name,
        avatar: assignment.user.avatar,
        total: 0,
        completed: 0,
        inProgress: 0,
      };

      existing.total++;
      if (doneColumnIds.includes(assignment.task.columnId)) {
        existing.completed++;
      }
      if (inProgressColumnIds.includes(assignment.task.columnId)) {
        existing.inProgress++;
      }

      userMap.set(assignment.userId, existing);
    }

    const result = Array.from(userMap.entries()).map(([userId, data]) => ({
      userId,
      ...data,
    }));

    // Cache for 5 minutes
    await redis?.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  /**
   * Get tasks grouped by priority
   */
  static async getTasksByPriority(projectId: string): Promise<TasksByPriorityData[]> {
    const cacheKey = `reports:tasks-by-priority:${projectId}`;
    const cached = await redis?.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const priorityCounts = await prisma.task.groupBy({
      by: ['priority'],
      where: {
        column: { projectId },
      },
      _count: {
        id: true,
      },
    });

    const totalTasks = priorityCounts.reduce((sum, p) => sum + p._count.id, 0);

    // Define priority order
    const priorityOrder = ['URGENT', 'HIGH', 'MEDIUM', 'LOW', null];

    const result = priorityOrder.map((priority) => {
      const found = priorityCounts.find((p) => p.priority === priority);
      const count = found?._count.id ?? 0;
      return {
        priority: priority ?? 'None',
        count,
        percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
      };
    });

    // Cache for 5 minutes
    await redis?.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  /**
   * Get completion metrics for a project
   */
  static async getCompletionMetrics(projectId: string): Promise<CompletionMetrics> {
    const cacheKey = `reports:completion-metrics:${projectId}`;
    const cached = await redis?.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get all columns
    const columns = await prisma.column.findMany({
      where: { projectId },
      select: { id: true, name: true },
    });
    const doneColumnIds = columns
      .filter((c) => c.name.toLowerCase().includes('done'))
      .map((c) => c.id);
    const notDoneColumnIds = columns
      .filter((c) => !c.name.toLowerCase().includes('done'))
      .map((c) => c.id);

    // Get total tasks
    const totalTasks = await prisma.task.count({
      where: { column: { projectId } },
    });

    // Get completed tasks
    const completedTasks = await prisma.task.count({
      where: { columnId: { in: doneColumnIds } },
    });

    // Get overdue tasks
    const overdueTasks = await prisma.task.count({
      where: {
        columnId: { in: notDoneColumnIds },
        dueDate: { lt: now },
      },
    });

    // Get completed this week
    const tasksCompletedThisWeek = await prisma.activity.count({
      where: {
        projectId,
        action: 'task.completed',
        createdAt: { gte: oneWeekAgo },
      },
    });

    // Get completed last week
    const tasksCompletedLastWeek = await prisma.activity.count({
      where: {
        projectId,
        action: 'task.completed',
        createdAt: {
          gte: twoWeeksAgo,
          lt: oneWeekAgo,
        },
      },
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overdueRate =
      totalTasks - completedTasks > 0
        ? Math.round((overdueTasks / (totalTasks - completedTasks)) * 100)
        : 0;
    const weekOverWeekChange =
      tasksCompletedLastWeek > 0
        ? Math.round(
            ((tasksCompletedThisWeek - tasksCompletedLastWeek) / tasksCompletedLastWeek) * 100
          )
        : tasksCompletedThisWeek > 0
          ? 100
          : 0;

    const result: CompletionMetrics = {
      totalTasks,
      completedTasks,
      completionRate,
      averageCompletionTime: null, // Would require tracking task creation to completion time
      overdueRate,
      tasksCompletedThisWeek,
      tasksCompletedLastWeek,
      weekOverWeekChange,
    };

    // Cache for 5 minutes
    await redis?.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  /**
   * Invalidate all reports cache for a project
   */
  static async invalidateProjectReports(projectId: string): Promise<void> {
    const keys = [
      `reports:tasks-over-time:${projectId}:*`,
      `reports:tasks-by-status:${projectId}`,
      `reports:tasks-by-assignee:${projectId}`,
      `reports:tasks-by-priority:${projectId}`,
      `reports:completion-metrics:${projectId}`,
    ];

    for (const key of keys) {
      if (key.includes('*')) {
        // For wildcard keys, we'd need to scan, but for simplicity we'll just delete common ranges
        for (const days of [7, 14, 30, 60, 90]) {
          await redis?.del(`reports:tasks-over-time:${projectId}:${days}`);
        }
      } else {
        await redis?.del(key);
      }
    }
  }
}
