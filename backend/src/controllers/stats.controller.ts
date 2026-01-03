import type { Response } from 'express';
import { StatsService } from '../services/stats.service.js';
import { ProjectService } from '../services/project.service.js';
import type { AuthenticatedRequest } from '../types/express.js';
import { logger } from '../config/logger.js';

export class StatsController {
  /**
   * GET /stats/dashboard
   * Get dashboard stats for the authenticated user
   */
  static async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const stats = await StatsService.getDashboardStats(userId);

      return res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get dashboard stats');
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve dashboard statistics',
        },
      });
    }
  }

  /**
   * GET /stats/projects/:projectId
   * Get stats for a specific project
   */
  static async getProjectStats(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user!.id;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Project ID is required',
          },
        });
      }

      // Verify user has access to project
      const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this project',
          },
        });
      }

      const stats = await StatsService.getProjectStats(projectId);

      return res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get project stats');
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve project statistics',
        },
      });
    }
  }
}
