import { prisma } from '../config/database.js';
import type { Column, Task } from '@prisma/client';
import type { CreateColumnInput, UpdateColumnInput } from '../validators/column.validator.js';
import { ProjectService } from './project.service.js';

type ColumnWithTasks = Column & {
  tasks?: Task[];
  _count?: { tasks: number };
};

export class ColumnService {
  // ============ COLUMN CRUD ============

  /**
   * Get all columns for a project with task counts
   */
  static async getProjectColumns(
    projectId: string,
    userId: string,
    includeTasks = false
  ): Promise<ColumnWithTasks[] | null> {
    // Check user has access to project
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    return prisma.column.findMany({
      where: { projectId },
      include: {
        ...(includeTasks && {
          tasks: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
          },
        }),
        _count: {
          select: { tasks: { where: { deletedAt: null } } },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Get a single column by ID
   */
  static async getColumnById(
    columnId: string,
    userId: string
  ): Promise<ColumnWithTasks | null> {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        project: {
          select: { id: true, deletedAt: true },
        },
        tasks: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { tasks: { where: { deletedAt: null } } },
        },
      },
    });

    if (!column || column.project.deletedAt) {
      return null;
    }

    // Check user has access to the project
    const hasAccess = await ProjectService.checkProjectAccess(column.projectId, userId);
    if (!hasAccess) {
      return null;
    }

    return column;
  }

  /**
   * Create a new column in a project
   */
  static async createColumn(
    projectId: string,
    userId: string,
    data: CreateColumnInput
  ): Promise<ColumnWithTasks | null> {
    // Check user has access (must be owner, admin, or member)
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId, [
      'OWNER',
      'ADMIN',
      'MEMBER',
    ]);
    if (!hasAccess) {
      return null;
    }

    // Determine order: if not provided, append at end
    let order = data.order;
    if (order === undefined) {
      const lastColumn = await prisma.column.findFirst({
        where: { projectId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = lastColumn ? lastColumn.order + 1 : 0;
    } else {
      // Shift existing columns at or after this order
      await prisma.column.updateMany({
        where: {
          projectId,
          order: { gte: order },
        },
        data: {
          order: { increment: 1 },
        },
      });
    }

    const column = await prisma.column.create({
      data: {
        name: data.name,
        color: data.color,
        order,
        projectId,
      },
      include: {
        _count: {
          select: { tasks: { where: { deletedAt: null } } },
        },
      },
    });

    return column;
  }

  /**
   * Update a column
   */
  static async updateColumn(
    columnId: string,
    userId: string,
    data: UpdateColumnInput
  ): Promise<ColumnWithTasks | null> {
    // Get column and check project access
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        project: { select: { id: true, deletedAt: true } },
      },
    });

    if (!column || column.project.deletedAt) {
      return null;
    }

    const hasAccess = await ProjectService.checkProjectAccess(column.projectId, userId, [
      'OWNER',
      'ADMIN',
      'MEMBER',
    ]);
    if (!hasAccess) {
      return null;
    }

    const updatedColumn = await prisma.column.update({
      where: { id: columnId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
      },
      include: {
        tasks: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { tasks: { where: { deletedAt: null } } },
        },
      },
    });

    return updatedColumn;
  }

  /**
   * Delete a column and optionally move tasks
   */
  static async deleteColumn(
    columnId: string,
    userId: string,
    moveTasksToColumnId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        project: { select: { id: true, deletedAt: true } },
        _count: { select: { tasks: { where: { deletedAt: null } } } },
      },
    });

    if (!column || column.project.deletedAt) {
      return { success: false, error: 'Column not found' };
    }

    // Only owner or admin can delete columns
    const hasAccess = await ProjectService.checkProjectAccess(column.projectId, userId, [
      'OWNER',
      'ADMIN',
    ]);
    if (!hasAccess) {
      return { success: false, error: 'Permission denied' };
    }

    // Check if column has tasks
    if (column._count.tasks > 0 && !moveTasksToColumnId) {
      return {
        success: false,
        error: 'Column has tasks. Provide moveTasksToColumnId or delete tasks first.',
      };
    }

    // If moving tasks, verify target column exists in same project
    if (moveTasksToColumnId) {
      const targetColumn = await prisma.column.findUnique({
        where: { id: moveTasksToColumnId },
        select: { projectId: true },
      });

      if (!targetColumn || targetColumn.projectId !== column.projectId) {
        return { success: false, error: 'Target column not found in this project' };
      }

      // Get highest order in target column
      const lastTask = await prisma.task.findFirst({
        where: { columnId: moveTasksToColumnId, deletedAt: null },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      const startOrder = lastTask ? lastTask.order + 1 : 0;

      // Move all tasks to target column
      const tasksToMove = await prisma.task.findMany({
        where: { columnId, deletedAt: null },
        orderBy: { order: 'asc' },
        select: { id: true },
      });

      await prisma.$transaction(
        tasksToMove.map((task, index) =>
          prisma.task.update({
            where: { id: task.id },
            data: {
              columnId: moveTasksToColumnId,
              order: startOrder + index,
            },
          })
        )
      );
    }

    // Delete the column
    await prisma.column.delete({
      where: { id: columnId },
    });

    // Reorder remaining columns to close the gap
    await this.reorderColumnsAfterDelete(column.projectId, column.order);

    return { success: true };
  }

  /**
   * Reorder a column within its project
   */
  static async reorderColumn(
    columnId: string,
    userId: string,
    newOrder: number
  ): Promise<ColumnWithTasks | null> {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        project: { select: { id: true, deletedAt: true } },
      },
    });

    if (!column || column.project.deletedAt) {
      return null;
    }

    const hasAccess = await ProjectService.checkProjectAccess(column.projectId, userId, [
      'OWNER',
      'ADMIN',
      'MEMBER',
    ]);
    if (!hasAccess) {
      return null;
    }

    const currentOrder = column.order;
    if (currentOrder === newOrder) {
      // No change needed
      return prisma.column.findUnique({
        where: { id: columnId },
        include: {
          _count: { select: { tasks: { where: { deletedAt: null } } } },
        },
      });
    }

    // Get total columns to validate newOrder
    const columnCount = await prisma.column.count({
      where: { projectId: column.projectId },
    });

    if (newOrder < 0 || newOrder >= columnCount) {
      return null; // Invalid order
    }

    // Reorder in a transaction
    await prisma.$transaction(async (tx) => {
      if (newOrder > currentOrder) {
        // Moving down: decrement orders of columns between current+1 and newOrder
        await tx.column.updateMany({
          where: {
            projectId: column.projectId,
            order: { gt: currentOrder, lte: newOrder },
          },
          data: { order: { decrement: 1 } },
        });
      } else {
        // Moving up: increment orders of columns between newOrder and current-1
        await tx.column.updateMany({
          where: {
            projectId: column.projectId,
            order: { gte: newOrder, lt: currentOrder },
          },
          data: { order: { increment: 1 } },
        });
      }

      // Set the column to its new order
      await tx.column.update({
        where: { id: columnId },
        data: { order: newOrder },
      });
    });

    return prisma.column.findUnique({
      where: { id: columnId },
      include: {
        tasks: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        _count: { select: { tasks: { where: { deletedAt: null } } } },
      },
    });
  }

  // ============ HELPERS ============

  /**
   * Reorder columns after a deletion to close the gap
   */
  private static async reorderColumnsAfterDelete(
    projectId: string,
    deletedOrder: number
  ): Promise<void> {
    await prisma.column.updateMany({
      where: {
        projectId,
        order: { gt: deletedOrder },
      },
      data: { order: { decrement: 1 } },
    });
  }

  /**
   * Check if user can access a column (via project access)
   */
  static async checkColumnAccess(columnId: string, userId: string): Promise<boolean> {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { projectId: true, project: { select: { deletedAt: true } } },
    });

    if (!column || column.project.deletedAt) {
      return false;
    }

    return ProjectService.checkProjectAccess(column.projectId, userId);
  }
}

export default ColumnService;
