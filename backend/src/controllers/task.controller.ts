import type { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  ReorderTaskInput,
  BulkDeleteInput,
  ListTasksQuery,
} from '../validators/task.validator.js';
import {
  broadcastTaskCreated,
  broadcastTaskUpdated,
  broadcastTaskDeleted,
  broadcastTaskMoved,
  broadcastTaskReordered,
} from '../sockets/broadcast.js';
import type { LiveTask } from '../types/presence.js';

/**
 * Convert a task from the service to LiveTask format for broadcasting.
 * Serializes Date objects to ISO strings.
 */
function toSerializableTask(task: Record<string, unknown>): LiveTask {
  return {
    ...task,
    dueDate: task.dueDate ? (task.dueDate as Date).toISOString() : null,
    createdAt: (task.createdAt as Date).toISOString(),
    updatedAt: (task.updatedAt as Date).toISOString(),
    deletedAt: task.deletedAt ? (task.deletedAt as Date).toISOString() : null,
  } as LiveTask;
}

export class TaskController {
  // ============ PROJECT-SCOPED TASK ROUTES ============

  /**
   * GET /projects/:projectId/tasks
   * List all tasks for a project
   */
  static async listByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const query: ListTasksQuery = {
        includeDeleted: req.query.includeDeleted === 'true',
        priority: req.query.priority as ListTasksQuery['priority'],
        search: req.query.search as string | undefined,
      };

      const tasks = await TaskService.getProjectTasks(projectId, userId, query);

      if (tasks === null) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found or you do not have access',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { tasks },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/:projectId/tasks
   * Create a new task in a project (columnId in body)
   */
  static async createInProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const { columnId, ...data } = req.body as CreateTaskInput & { columnId: string };

      if (!columnId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'columnId is required in request body',
          },
        });
        return;
      }

      const task = await TaskService.createTaskInProject(projectId, columnId, userId, data);

      if (!task) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to create tasks in this project or column does not exist',
          },
        });
        return;
      }

      // Broadcast to project room
      if (task.column?.projectId) {
        broadcastTaskCreated(task.column.projectId, toSerializableTask(task), userId);
      }

      res.status(201).json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ COLUMN-SCOPED TASK ROUTES ============

  /**
   * GET /columns/:columnId/tasks
   * List all tasks for a column
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const columnId = req.params.columnId as string;
      const query: ListTasksQuery = {
        includeDeleted: req.query.includeDeleted === 'true',
        priority: req.query.priority as ListTasksQuery['priority'],
        search: req.query.search as string | undefined,
      };

      const tasks = await TaskService.getColumnTasks(columnId, userId, query);

      if (tasks === null) {
        res.status(404).json({
          success: false,
          error: {
            code: 'COLUMN_NOT_FOUND',
            message: 'Column not found or you do not have access',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { tasks },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/:taskId
   * Get a single task by ID
   */
  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.taskId as string;

      const task = await TaskService.getTaskById(taskId, userId);

      if (!task) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found or you do not have access',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /columns/:columnId/tasks
   * Create a new task in a column
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const columnId = req.params.columnId as string;
      const data = req.body as CreateTaskInput;

      const task = await TaskService.createTask(columnId, userId, data);

      if (!task) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to create tasks in this column',
          },
        });
        return;
      }

      // Broadcast to project room
      if (task.column?.projectId) {
        broadcastTaskCreated(task.column.projectId, toSerializableTask(task), userId);
      }

      res.status(201).json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /tasks/:taskId
   * Update a task
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.taskId as string;
      const data = req.body as UpdateTaskInput;

      const task = await TaskService.updateTask(taskId, userId, data);

      if (!task) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found or you do not have permission to update it',
          },
        });
        return;
      }

      // Broadcast to project room
      if (task.column?.projectId) {
        broadcastTaskUpdated(task.column.projectId, toSerializableTask(task), userId);
      }

      res.json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /tasks/:taskId
   * Soft delete a task
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.taskId as string;

      // Get task info before deletion for broadcasting
      const taskInfo = await TaskService.getTaskById(taskId, userId);
      const projectId = taskInfo?.column?.projectId;
      const columnId = taskInfo?.columnId;

      const result = await TaskService.deleteTask(taskId, userId);

      if (!result.success) {
        const statusCode = result.error === 'Permission denied' ? 403 : 404;
        const errorCode =
          result.error === 'Permission denied' ? 'FORBIDDEN' : 'TASK_NOT_FOUND';

        res.status(statusCode).json({
          success: false,
          error: {
            code: errorCode,
            message: result.error,
          },
        });
        return;
      }

      // Broadcast to project room
      if (projectId && columnId) {
        broadcastTaskDeleted(projectId, taskId, columnId, userId);
      }

      res.json({
        success: true,
        data: { message: 'Task deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks/bulk-delete
   * Bulk soft delete multiple tasks
   */
  static async bulkDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { taskIds } = req.body as BulkDeleteInput;

      const result = await TaskService.bulkDeleteTasks(taskIds, userId);

      if (!result.success) {
        res.status(207).json({
          success: false,
          data: {
            deleted: result.deleted,
            errors: result.errors,
            message: `Deleted ${result.deleted} of ${taskIds.length} tasks`,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          deleted: result.deleted,
          message: `${result.deleted} task(s) deleted successfully`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /tasks/:taskId/move
   * Move a task to a different column and/or position
   */
  static async move(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.taskId as string;
      const data = req.body as MoveTaskInput;

      // Get original task info before move
      const originalTask = await TaskService.getTaskById(taskId, userId);
      const fromColumnId = originalTask?.columnId;

      const task = await TaskService.moveTask(taskId, userId, data);

      if (!task) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MOVE_FAILED',
            message:
              'Could not move task. Check task ID, target column, and order value.',
          },
        });
        return;
      }

      // Broadcast to project room
      if (task.column?.projectId && fromColumnId) {
        if (fromColumnId !== data.targetColumnId) {
          // Task moved to different column
          broadcastTaskMoved(
            {
              taskId,
              fromColumnId,
              toColumnId: data.targetColumnId,
              order: task.order,
              projectId: task.column.projectId,
            },
            userId
          );
        } else {
          // Task reordered within same column
          broadcastTaskReordered(
            {
              taskId,
              columnId: task.columnId,
              order: task.order,
              projectId: task.column.projectId,
            },
            userId
          );
        }
      }

      res.json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /tasks/:taskId/reorder
   * Reorder a task within its column
   */
  static async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.taskId as string;
      const { order } = req.body as ReorderTaskInput;

      const task = await TaskService.reorderTaskInColumn(taskId, userId, order);

      if (!task) {
        res.status(400).json({
          success: false,
          error: {
            code: 'REORDER_FAILED',
            message: 'Could not reorder task. Check task ID and order value.',
          },
        });
        return;
      }

      // Broadcast to project room
      if (task.column?.projectId) {
        broadcastTaskReordered(
          {
            taskId,
            columnId: task.columnId,
            order: task.order,
            projectId: task.column.projectId,
          },
          userId
        );
      }

      res.json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TaskController;
