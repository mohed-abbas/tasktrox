import { prisma } from '../config/database.js';
import type { SearchQueryInput } from '../validators/search.validator.js';

export interface TaskSearchResult {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  column: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  labels: { id: string; name: string; color: string }[];
  assignees: { id: string; name: string; avatar: string | null }[];
}

export interface ProjectSearchResult {
  id: string;
  name: string;
  description: string | null;
  _count: { tasks: number; columns: number };
}

export interface SearchResult {
  tasks: TaskSearchResult[];
  projects: ProjectSearchResult[];
}

/**
 * Search tasks and projects for a user.
 * Searches across all projects the user has access to, or filters by projectId.
 */
export async function search(
  userId: string,
  query: SearchQueryInput
): Promise<SearchResult> {
  const { q, projectId, limit = 10 } = query;
  const searchTerm = q.trim().toLowerCase();

  // Get user's project IDs for access control
  const userProjects = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const accessibleProjectIds = userProjects.map((p: { projectId: string }) => p.projectId);

  // If specific project requested, verify access
  if (projectId && !accessibleProjectIds.includes(projectId)) {
    return { tasks: [], projects: [] };
  }

  const projectFilter = projectId ? [projectId] : accessibleProjectIds;

  // Search tasks
  const tasks = await prisma.task.findMany({
    where: {
      column: {
        projectId: { in: projectFilter },
      },
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    include: {
      column: {
        select: { id: true, name: true, projectId: true },
      },
      labels: {
        include: {
          label: {
            select: { id: true, name: true, color: true },
          },
        },
      },
      assignees: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
    },
    take: limit,
    orderBy: { updatedAt: 'desc' },
  });

  // Get project info for tasks
  const projectIds = [...new Set(tasks.map((t: { column: { projectId: string } }) => t.column.projectId))];
  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, name: true },
  });
  const projectMap = new Map(projects.map((p: { id: string; name: string }) => [p.id, p]));

  // Search projects (only if not filtering by specific project)
  let projectResults: ProjectSearchResult[] = [];
  if (!projectId) {
    const rawProjects = await prisma.project.findMany({
      where: {
        id: { in: accessibleProjectIds },
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        _count: { select: { columns: true } },
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    // Get task counts for projects
    const taskCounts = await prisma.task.groupBy({
      by: ['columnId'],
      where: {
        column: {
          projectId: { in: rawProjects.map((p: { id: string }) => p.id) },
        },
      },
      _count: true,
    });

    // Get columns for projects to map task counts
    const columns = await prisma.column.findMany({
      where: { projectId: { in: rawProjects.map((p: { id: string }) => p.id) } },
      select: { id: true, projectId: true },
    });
    const columnToProject = new Map(
      columns.map((c: { id: string; projectId: string }) => [c.id, c.projectId])
    );

    const projectTaskCounts = new Map<string, number>();
    for (const tc of taskCounts) {
      const projId = columnToProject.get(tc.columnId);
      if (projId) {
        projectTaskCounts.set(
          projId,
          (projectTaskCounts.get(projId) || 0) + (tc._count as unknown as number)
        );
      }
    }

    projectResults = rawProjects.map(
      (p: { id: string; name: string; description: string | null; _count: { columns: number } }) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        _count: {
          columns: p._count.columns,
          tasks: projectTaskCounts.get(p.id) || 0,
        },
      })
    );
  }

  return {
    tasks: tasks.map(
      (task: {
        id: string;
        title: string;
        description: string | null;
        priority: string | null;
        column: { id: string; name: string; projectId: string };
        labels: { label: { id: string; name: string; color: string } }[];
        assignees: { user: { id: string; name: string; avatar: string | null } }[];
      }) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        column: {
          id: task.column.id,
          name: task.column.name,
        },
        project: projectMap.get(task.column.projectId) || { id: '', name: '' },
        labels: task.labels.map(
          (l: { label: { id: string; name: string; color: string } }) => l.label
        ),
        assignees: task.assignees.map(
          (a: { user: { id: string; name: string; avatar: string | null } }) => a.user
        ),
      })
    ),
    projects: projectResults,
  };
}
