import type { Request, Response, NextFunction } from 'express';
import { ColumnService } from '../services/column.service.js';
import type {
  CreateColumnInput,
  UpdateColumnInput,
  ReorderColumnInput,
  ReorderProjectColumnInput,
} from '../validators/column.validator.js';

export class ColumnController {
  // ============ COLUMN CRUD ============

  /**
   * GET /projects/:projectId/columns
   * List all columns for a project
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const includeTasks = req.query.includeTasks === 'true';

      const columns = await ColumnService.getProjectColumns(projectId, userId, includeTasks);

      if (columns === null) {
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
        data: { columns },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /columns/:columnId
   * Get a single column by ID
   */
  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const columnId = req.params.columnId as string;

      const column = await ColumnService.getColumnById(columnId, userId);

      if (!column) {
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
        data: { column },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/:projectId/columns
   * Create a new column
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const data = req.body as CreateColumnInput;

      const column = await ColumnService.createColumn(projectId, userId, data);

      if (!column) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to create columns in this project',
          },
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: { column },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /columns/:columnId
   * Update a column
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const columnId = req.params.columnId as string;
      const data = req.body as UpdateColumnInput;

      const column = await ColumnService.updateColumn(columnId, userId, data);

      if (!column) {
        res.status(404).json({
          success: false,
          error: {
            code: 'COLUMN_NOT_FOUND',
            message: 'Column not found or you do not have permission to update it',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { column },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /columns/:columnId
   * Delete a column
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const columnId = req.params.columnId as string;
      const moveTasksToColumnId = req.query.moveTasksTo as string | undefined;

      const result = await ColumnService.deleteColumn(columnId, userId, moveTasksToColumnId);

      if (!result.success) {
        const statusCode = result.error === 'Permission denied' ? 403 : 400;
        const errorCode =
          result.error === 'Permission denied'
            ? 'FORBIDDEN'
            : result.error === 'Column not found'
              ? 'COLUMN_NOT_FOUND'
              : 'COLUMN_HAS_TASKS';

        res.status(statusCode).json({
          success: false,
          error: {
            code: errorCode,
            message: result.error,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { message: 'Column deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /columns/:columnId/reorder
   * Reorder a column within its project
   */
  static async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const columnId = req.params.columnId as string;
      const { newOrder } = req.body as ReorderColumnInput;

      const column = await ColumnService.reorderColumn(columnId, userId, newOrder);

      if (!column) {
        res.status(400).json({
          success: false,
          error: {
            code: 'REORDER_FAILED',
            message: 'Could not reorder column. Check column ID and order value.',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { column },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /projects/:projectId/columns/:columnId/reorder
   * Reorder a column within a project (project-scoped route)
   */
  static async reorderInProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const columnId = req.params.columnId as string;
      const { order } = req.body as ReorderProjectColumnInput;

      const column = await ColumnService.reorderColumn(columnId, userId, order);

      if (!column) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Column not found or you do not have permission to reorder it',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { column },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ColumnController;
