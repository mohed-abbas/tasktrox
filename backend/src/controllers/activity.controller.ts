import type { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service.js';
import type { PaginationQuery } from '../validators/activity.validator.js';

export class ActivityController {
  /**
   * GET /projects/:projectId/activities
   * List activities for a project with pagination
   */
  static async listByProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const { limit, offset } = req.query as unknown as PaginationQuery;

      const activities = await ActivityService.getProjectActivities(
        projectId,
        userId,
        { limit, offset }
      );

      if (activities === null) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found or you do not have access',
          },
        });
        return;
      }

      // Get total count for pagination
      const total = await ActivityService.getProjectActivityCount(projectId, userId);

      res.json({
        success: true,
        data: { activities },
        meta: {
          total: total ?? 0,
          limit,
          offset,
          hasMore: (offset + activities.length) < (total ?? 0),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/:projectId/tasks/:taskId/activities
   * List activities for a specific task
   */
  static async listByTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const taskId = req.params.taskId as string;
      const { limit, offset } = req.query as unknown as PaginationQuery;

      const activities = await ActivityService.getTaskActivities(
        taskId,
        userId,
        { limit, offset }
      );

      if (activities === null) {
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
        data: { activities },
        meta: {
          limit,
          offset,
          hasMore: activities.length === limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /activities/me
   * List recent activities for the current user across all projects
   */
  static async listUserActivities(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { limit, offset } = req.query as unknown as PaginationQuery;

      const activities = await ActivityService.getUserRecentActivities(userId, {
        limit,
        offset,
      });

      res.json({
        success: true,
        data: { activities },
        meta: {
          limit,
          offset,
          hasMore: activities.length === limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ActivityController;
