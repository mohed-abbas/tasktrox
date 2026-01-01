import type { Request, Response, NextFunction } from 'express';
import { LabelService } from '../services/label.service.js';
import type {
  CreateLabelInput,
  UpdateLabelInput,
  AddTaskLabelInput,
  SetTaskLabelsInput,
} from '../validators/label.validator.js';

export class LabelController {
  // ============ LABEL CRUD ============

  /**
   * GET /projects/:projectId/labels
   * List all labels for a project
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;

      const labels = await LabelService.getProjectLabels(projectId, userId);

      if (labels === null) {
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
        data: { labels },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/:projectId/labels/:labelId
   * Get a single label by ID
   */
  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const labelId = req.params.labelId as string;

      const label = await LabelService.getLabelById(projectId, labelId, userId);

      if (!label) {
        res.status(404).json({
          success: false,
          error: {
            code: 'LABEL_NOT_FOUND',
            message: 'Label not found or you do not have access',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { label },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/:projectId/labels
   * Create a new label
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const data = req.body as CreateLabelInput;

      const label = await LabelService.createLabel(projectId, userId, data);

      if (!label) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to create labels in this project',
          },
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: { label },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_LABEL',
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * PATCH /projects/:projectId/labels/:labelId
   * Update a label
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const labelId = req.params.labelId as string;
      const data = req.body as UpdateLabelInput;

      const label = await LabelService.updateLabel(projectId, labelId, userId, data);

      if (!label) {
        res.status(404).json({
          success: false,
          error: {
            code: 'LABEL_NOT_FOUND',
            message: 'Label not found or you do not have permission to update it',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { label },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_LABEL',
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /projects/:projectId/labels/:labelId
   * Delete a label
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const labelId = req.params.labelId as string;

      const result = await LabelService.deleteLabel(projectId, labelId, userId);

      if (!result.success) {
        const statusCode = result.error === 'Permission denied' ? 403 : 404;
        const errorCode =
          result.error === 'Permission denied' ? 'FORBIDDEN' : 'LABEL_NOT_FOUND';

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
        data: { message: 'Label deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ TASK LABEL OPERATIONS ============

  /**
   * POST /projects/:projectId/tasks/:taskId/labels
   * Add a label to a task
   */
  static async addToTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const taskId = req.params.taskId as string;
      const { labelId } = req.body as AddTaskLabelInput;

      const taskLabel = await LabelService.addLabelToTask(
        projectId,
        taskId,
        labelId,
        userId
      );

      if (!taskLabel) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to modify this task',
          },
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: { taskLabel },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * DELETE /projects/:projectId/tasks/:taskId/labels/:labelId
   * Remove a label from a task
   */
  static async removeFromTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const taskId = req.params.taskId as string;
      const labelId = req.params.labelId as string;

      const result = await LabelService.removeLabelFromTask(
        projectId,
        taskId,
        labelId,
        userId
      );

      if (!result.success) {
        const statusCode = result.error === 'Permission denied' ? 403 : 404;
        res.status(statusCode).json({
          success: false,
          error: {
            code: statusCode === 403 ? 'FORBIDDEN' : 'NOT_FOUND',
            message: result.error,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { message: 'Label removed from task successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /projects/:projectId/tasks/:taskId/labels
   * Replace all labels on a task
   */
  static async setTaskLabels(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const taskId = req.params.taskId as string;
      const { labelIds } = req.body as SetTaskLabelsInput;

      const labels = await LabelService.setTaskLabels(
        projectId,
        taskId,
        labelIds,
        userId
      );

      if (labels === null) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to modify this task',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { labels },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('do not exist')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * GET /projects/:projectId/tasks/:taskId/labels
   * Get all labels for a task
   */
  static async getTaskLabels(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const taskId = req.params.taskId as string;

      const labels = await LabelService.getTaskLabels(projectId, taskId, userId);

      if (labels === null) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have access',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { labels },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LabelController;
