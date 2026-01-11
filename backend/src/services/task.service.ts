import { prisma } from '../config/database.js';
import type { Task, Priority } from '@prisma/client';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  ListTasksQuery,
  GlobalTasksQuery,
} from '../validators/task.validator.js';
import { ColumnService } from './column.service.js';
import { ProjectService } from './project.service.js';
import { taskCache } from './cache.service.js';
import { ActivityService, ActivityAction } from './activity.service.js';
import { sanitizeDescription } from '../utils/sanitize.js';

type TaskWithRelations = Task & {
  column?: {
    id: string;
    name: string;
    projectId: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  labels?: {
    id: string;
    name: string;
    color: string;
  }[];
  assignees?: {
    id: string;
    name: string;
    avatar: string | null;
  }[];
  _count?: {
    assignees: number;
    attachments: number;
    comments: number;
  };
};

// Extended type for global tasks (includes project info)
type GlobalTaskWithRelations = TaskWithRelations & {
  project?: {
    id: string;
    name: string;
    color: string;
  };
};

// Raw Prisma result type (with nested label/user objects)
type PrismaTaskResult = Omit<TaskWithRelations, 'labels' | 'assignees'> & {
  labels?: { label: { id: string; name: string; color: string } }[];
  assignees?: { user: { id: string; name: string; avatar: string | null } }[];
};

// Transform Prisma result to expected format (flatten nested relations)
function transformTask(task: PrismaTaskResult): TaskWithRelations {
  return {
    ...task,
    labels: task.labels?.map((tl) => tl.label),
    assignees: task.assignees?.map((ta) => ta.user),
  };
}

function transformTasks(tasks: PrismaTaskResult[]): TaskWithRelations[] {
  return tasks.map(transformTask);
}

export class TaskService {
  // ============ GLOBAL TASKS ============

  /**
   * Get all tasks across all projects the user is a member of
   * Supports filtering by status, priority, project, due date, and search
   */
  static async getUserTasks(
    userId: string,
    options: Partial<GlobalTasksQuery> = {}
  ): Promise<{ tasks: GlobalTaskWithRelations[]; total: number }> {
    const {
      status = 'all',
      priority,
      projectId,
      assignedToMe,
      dueBefore,
      dueAfter,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc',
      limit: rawLimit = 50,
      offset: rawOffset = 0,
    } = options;

    // Ensure limit and offset are numbers (query params may come as strings)
    const limit = typeof rawLimit === 'string' ? parseInt(rawLimit, 10) : rawLimit;
    const offset = typeof rawOffset === 'string' ? parseInt(rawOffset, 10) : rawOffset;

    // Build where clause
    const whereClause: Record<string, unknown> = {
      deletedAt: null,
      column: {
        project: {
          deletedAt: null,
          members: {
            some: { userId },
          },
          // Filter by specific project if provided
          ...(projectId && { id: projectId }),
        },
      },
    };

    // Status filter
    if (status === 'active') {
      whereClause.completedAt = null;
    } else if (status === 'completed') {
      whereClause.completedAt = { not: null };
    }

    // Priority filter
    if (priority) {
      whereClause.priority = priority;
    }

    // Assigned to me filter
    if (assignedToMe) {
      whereClause.assignees = {
        some: { userId },
      };
    }

    // Due date filters
    if (dueBefore || dueAfter) {
      whereClause.dueDate = {
        ...(dueBefore && { lte: new Date(dueBefore) }),
        ...(dueAfter && { gte: new Date(dueAfter) }),
      };
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build order by clause - use explicit types for Prisma
    const orderByOptions = {
      dueDate: { dueDate: sortOrder as 'asc' | 'desc' },
      priority: { priority: sortOrder as 'asc' | 'desc' },
      createdAt: { createdAt: sortOrder as 'asc' | 'desc' },
      project: { column: { project: { name: sortOrder as 'asc' | 'desc' } } },
    };
    const orderBy = orderByOptions[sortBy as keyof typeof orderByOptions] || { dueDate: 'asc' as const };

    // Get total count for pagination
    const total = await prisma.task.count({ where: whereClause });

    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        column: {
          select: {
            id: true,
            name: true,
            projectId: true,
            project: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        labels: {
          select: {
            label: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        assignees: {
          select: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { assignees: true, attachments: true, comments: true },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    });

    // Transform to flatten nested relations and extract project info
    const transformedTasks = tasks.map((task) => {
      const column = task.column as {
        id: string;
        name: string;
        projectId: string;
        project: { id: string; name: string; color: string };
      };
      return {
        ...task,
        labels: (task.labels as { label: { id: string; name: string; color: string } }[])?.map(
          (tl) => tl.label
        ),
        assignees: (task.assignees as { user: { id: string; name: string; avatar: string | null } }[])?.map(
          (ta) => ta.user
        ),
        project: column.project,
        column: {
          id: column.id,
          name: column.name,
          projectId: column.projectId,
        },
      } as GlobalTaskWithRelations;
    });

    return { tasks: transformedTasks, total };
  }

  // ============ TASK CRUD ============

  /**
   * Get all tasks for a project (across all columns)
   * Results are cached for 30 seconds (no filters) or bypassed (with filters)
   */
  static async getProjectTasks(
    projectId: string,
    userId: string,
    options: ListTasksQuery = {}
  ): Promise<TaskWithRelations[] | null> {
    // Check user has access to the project
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    const hasFilters = options.priority || options.search || options.includeDeleted;

    const fetchTasks = async () => {
      const whereClause: Record<string, unknown> = {
        column: { projectId },
        ...(options.includeDeleted ? {} : { deletedAt: null }),
        ...(options.priority && { priority: options.priority }),
        ...(options.search && {
          OR: [
            { title: { contains: options.search, mode: 'insensitive' } },
            { description: { contains: options.search, mode: 'insensitive' } },
          ],
        }),
      };

      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
          column: {
            select: { id: true, name: true, projectId: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          labels: {
            select: {
              label: {
                select: { id: true, name: true, color: true },
              },
            },
          },
          assignees: {
            select: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
          _count: {
            select: { assignees: true, attachments: true, comments: true },
          },
        },
        orderBy: [{ column: { order: 'asc' } }, { order: 'asc' }],
      });

      return transformTasks(tasks as unknown as PrismaTaskResult[]);
    };

    // Only cache if no filters applied (default view)
    if (hasFilters) {
      return fetchTasks();
    }

    return taskCache.getProjectTasks(projectId, fetchTasks);
  }

  /**
   * Create a task from project scope (columnId in body)
   */
  static async createTaskInProject(
    projectId: string,
    columnId: string,
    userId: string,
    data: CreateTaskInput
  ): Promise<TaskWithRelations | null> {
    // Verify the column belongs to this project
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { projectId: true },
    });

    if (!column || column.projectId !== projectId) {
      return null;
    }

    // Use the existing createTask method
    return this.createTask(columnId, userId, data);
  }

  /**
   * Get all tasks for a column
   */
  static async getColumnTasks(
    columnId: string,
    userId: string,
    options: ListTasksQuery = {}
  ): Promise<TaskWithRelations[] | null> {
    // Check user has access to column's project
    const hasAccess = await ColumnService.checkColumnAccess(columnId, userId);
    if (!hasAccess) {
      return null;
    }

    const whereClause: Record<string, unknown> = {
      columnId,
      ...(options.includeDeleted ? {} : { deletedAt: null }),
      ...(options.priority && { priority: options.priority }),
      ...(options.search && {
        OR: [
          { title: { contains: options.search, mode: 'insensitive' } },
          { description: { contains: options.search, mode: 'insensitive' } },
        ],
      }),
    };

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        labels: {
          select: {
            label: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        assignees: {
          select: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { assignees: true, attachments: true, comments: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return transformTasks(tasks as unknown as PrismaTaskResult[]);
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(
    taskId: string,
    userId: string
  ): Promise<TaskWithRelations | null> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: {
            id: true,
            name: true,
            projectId: true,
            project: { select: { deletedAt: true } },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        labels: {
          select: {
            label: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        assignees: {
          select: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { assignees: true, attachments: true, comments: true },
        },
      },
    });

    if (!task || task.deletedAt || task.column.project.deletedAt) {
      return null;
    }

    // Check user has access to the project
    const hasAccess = await ProjectService.checkProjectAccess(
      task.column.projectId,
      userId
    );
    if (!hasAccess) {
      return null;
    }

    return transformTask(task as unknown as PrismaTaskResult);
  }

  /**
   * Create a new task in a column
   */
  static async createTask(
    columnId: string,
    userId: string,
    data: CreateTaskInput
  ): Promise<TaskWithRelations | null> {
    // Get column and verify access
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        project: { select: { id: true, deletedAt: true } },
      },
    });

    if (!column || column.project.deletedAt) {
      return null;
    }

    // Check user has create permission (owner, admin, or member)
    const hasAccess = await ProjectService.checkProjectAccess(
      column.projectId,
      userId,
      ['OWNER', 'ADMIN', 'MEMBER']
    );
    if (!hasAccess) {
      return null;
    }

    // Determine order: if not provided, append at end
    let order = data.order;
    if (order === undefined) {
      const lastTask = await prisma.task.findFirst({
        where: { columnId, deletedAt: null },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = lastTask ? lastTask.order + 1 : 0;
    } else {
      // Shift existing tasks at or after this order
      await prisma.task.updateMany({
        where: {
          columnId,
          deletedAt: null,
          order: { gte: order },
        },
        data: {
          order: { increment: 1 },
        },
      });
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: sanitizeDescription(data.description),
        priority: data.priority as Priority | undefined,
        dueDate: data.dueDate && data.dueDate !== '' ? new Date(data.dueDate) : null,
        order,
        columnId,
        createdById: userId,
      },
      include: {
        column: {
          select: { id: true, name: true, projectId: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: { assignees: true, attachments: true, comments: true },
        },
      },
    });

    // Invalidate project tasks cache
    await taskCache.invalidateProjectTasks(column.projectId);

    return task;
  }

  /**
   * Update a task
   */
  static async updateTask(
    taskId: string,
    userId: string,
    data: UpdateTaskInput
  ): Promise<TaskWithRelations | null> {
    // Get task and check project access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: { projectId: true, project: { select: { deletedAt: true } } },
        },
      },
    });

    if (!task || task.deletedAt || task.column.project.deletedAt) {
      return null;
    }

    const hasAccess = await ProjectService.checkProjectAccess(
      task.column.projectId,
      userId,
      ['OWNER', 'ADMIN', 'MEMBER']
    );
    if (!hasAccess) {
      return null;
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = sanitizeDescription(data.description);
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate =
        data.dueDate === null || data.dueDate === '' ? null : new Date(data.dueDate);
    }

    // Handle task completion
    const wasCompleted = task.completedAt !== null;
    if (data.completed !== undefined) {
      updateData.completedAt = data.completed ? new Date() : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        column: {
          select: { id: true, name: true, projectId: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: { assignees: true, attachments: true, comments: true },
        },
      },
    });

    // Log activity for task completion/reopening
    if (data.completed !== undefined) {
      const isNowCompleted = updatedTask.completedAt !== null;
      if (isNowCompleted && !wasCompleted) {
        // Task was just completed
        ActivityService.logAsync({
          action: ActivityAction.TASK_COMPLETED,
          projectId: task.column.projectId,
          userId,
          taskId,
          metadata: {
            taskTitle: updatedTask.title,
            taskId,
          },
        });
      } else if (!isNowCompleted && wasCompleted) {
        // Task was reopened
        ActivityService.logAsync({
          action: ActivityAction.TASK_REOPENED,
          projectId: task.column.projectId,
          userId,
          taskId,
          metadata: {
            taskTitle: updatedTask.title,
            taskId,
          },
        });
      }
    }

    // Invalidate task and project caches
    await taskCache.invalidateTask(taskId, task.column.projectId);

    return updatedTask;
  }

  /**
   * Soft delete a task
   */
  static async deleteTask(
    taskId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: { projectId: true, project: { select: { deletedAt: true } } },
        },
      },
    });

    if (!task || task.deletedAt || task.column.project.deletedAt) {
      return { success: false, error: 'Task not found' };
    }

    // Only owner, admin, member, or task creator can delete
    const hasAccess = await ProjectService.checkProjectAccess(
      task.column.projectId,
      userId,
      ['OWNER', 'ADMIN', 'MEMBER']
    );

    if (!hasAccess && task.createdById !== userId) {
      return { success: false, error: 'Permission denied' };
    }

    // Soft delete
    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    // Reorder remaining tasks to close the gap
    await this.reorderTasksAfterDelete(task.columnId, task.order);

    // Invalidate task and project caches
    await taskCache.invalidateTask(taskId, task.column.projectId);

    return { success: true };
  }

  /**
   * Bulk soft delete tasks
   */
  static async bulkDeleteTasks(
    taskIds: string[],
    userId: string
  ): Promise<{ success: boolean; deleted: number; errors: string[] }> {
    const errors: string[] = [];
    let deleted = 0;

    for (const taskId of taskIds) {
      const result = await this.deleteTask(taskId, userId);
      if (result.success) {
        deleted++;
      } else {
        errors.push(`${taskId}: ${result.error}`);
      }
    }

    return {
      success: errors.length === 0,
      deleted,
      errors,
    };
  }

  /**
   * Move a task to a different column and/or position
   */
  static async moveTask(
    taskId: string,
    userId: string,
    data: MoveTaskInput
  ): Promise<TaskWithRelations | null> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: { projectId: true, project: { select: { deletedAt: true } } },
        },
      },
    });

    if (!task || task.deletedAt || task.column.project.deletedAt) {
      return null;
    }

    // Check project access
    const hasAccess = await ProjectService.checkProjectAccess(
      task.column.projectId,
      userId,
      ['OWNER', 'ADMIN', 'MEMBER']
    );
    if (!hasAccess) {
      return null;
    }

    // Verify target column exists in same project
    const targetColumn = await prisma.column.findUnique({
      where: { id: data.targetColumnId },
      select: { projectId: true },
    });

    if (!targetColumn || targetColumn.projectId !== task.column.projectId) {
      return null;
    }

    const sourceColumnId = task.columnId;
    const sourceOrder = task.order;
    const targetColumnId = data.targetColumnId;
    const targetOrder = data.order;

    // Same column reorder
    if (sourceColumnId === targetColumnId) {
      return this.reorderTaskInColumn(taskId, userId, targetOrder);
    }

    // Move to different column
    await prisma.$transaction(async (tx) => {
      // Decrement orders in source column for tasks after this one
      await tx.task.updateMany({
        where: {
          columnId: sourceColumnId,
          deletedAt: null,
          order: { gt: sourceOrder },
        },
        data: { order: { decrement: 1 } },
      });

      // Increment orders in target column for tasks at or after target position
      await tx.task.updateMany({
        where: {
          columnId: targetColumnId,
          deletedAt: null,
          order: { gte: targetOrder },
        },
        data: { order: { increment: 1 } },
      });

      // Move the task
      await tx.task.update({
        where: { id: taskId },
        data: {
          columnId: targetColumnId,
          order: targetOrder,
        },
      });
    });

    // Invalidate project tasks cache (task moved within project)
    await taskCache.invalidateTask(taskId, task.column.projectId);

    return prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: { id: true, name: true, projectId: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: { assignees: true, attachments: true, comments: true },
        },
      },
    });
  }

  /**
   * Reorder a task within its column
   */
  static async reorderTaskInColumn(
    taskId: string,
    userId: string,
    newOrder: number
  ): Promise<TaskWithRelations | null> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: { projectId: true, project: { select: { deletedAt: true } } },
        },
      },
    });

    if (!task || task.deletedAt || task.column.project.deletedAt) {
      return null;
    }

    const hasAccess = await ProjectService.checkProjectAccess(
      task.column.projectId,
      userId,
      ['OWNER', 'ADMIN', 'MEMBER']
    );
    if (!hasAccess) {
      return null;
    }

    const currentOrder = task.order;
    if (currentOrder === newOrder) {
      // No change needed
      return prisma.task.findUnique({
        where: { id: taskId },
        include: {
          column: { select: { id: true, name: true, projectId: true } },
          createdBy: { select: { id: true, name: true, email: true, avatar: true } },
          _count: { select: { assignees: true, attachments: true, comments: true } },
        },
      });
    }

    // Get task count to validate newOrder
    const taskCount = await prisma.task.count({
      where: { columnId: task.columnId, deletedAt: null },
    });

    if (newOrder < 0 || newOrder >= taskCount) {
      return null; // Invalid order
    }

    // Reorder in a transaction
    await prisma.$transaction(async (tx) => {
      if (newOrder > currentOrder) {
        // Moving down: decrement orders of tasks between current+1 and newOrder
        await tx.task.updateMany({
          where: {
            columnId: task.columnId,
            deletedAt: null,
            order: { gt: currentOrder, lte: newOrder },
          },
          data: { order: { decrement: 1 } },
        });
      } else {
        // Moving up: increment orders of tasks between newOrder and current-1
        await tx.task.updateMany({
          where: {
            columnId: task.columnId,
            deletedAt: null,
            order: { gte: newOrder, lt: currentOrder },
          },
          data: { order: { increment: 1 } },
        });
      }

      // Set the task to its new order
      await tx.task.update({
        where: { id: taskId },
        data: { order: newOrder },
      });
    });

    return prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: { select: { id: true, name: true, projectId: true } },
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { assignees: true, attachments: true, comments: true } },
      },
    });
  }

  // ============ HELPERS ============

  /**
   * Reorder tasks after a deletion to close the gap
   */
  private static async reorderTasksAfterDelete(
    columnId: string,
    deletedOrder: number
  ): Promise<void> {
    await prisma.task.updateMany({
      where: {
        columnId,
        deletedAt: null,
        order: { gt: deletedOrder },
      },
      data: { order: { decrement: 1 } },
    });
  }

  /**
   * Check if user can access a task (via project access)
   */
  static async checkTaskAccess(taskId: string, userId: string): Promise<boolean> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        deletedAt: true,
        column: {
          select: { projectId: true, project: { select: { deletedAt: true } } },
        },
      },
    });

    if (!task || task.deletedAt || task.column.project.deletedAt) {
      return false;
    }

    return ProjectService.checkProjectAccess(task.column.projectId, userId);
  }
}

export default TaskService;
