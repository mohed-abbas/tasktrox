import type { Response } from 'express';
import { ReportsService } from '../services/reports.service.js';
import { ProjectService } from '../services/project.service.js';
import type { AuthenticatedRequest } from '../types/express.js';
import { logger } from '../config/logger.js';

export class ReportsController {
  /**
   * GET /projects/:projectId/reports/tasks-over-time
   * Get tasks created and completed over time
   */
  static async getTasksOverTime(req: AuthenticatedRequest, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const userId = req.user!.id;
      const days = parseInt(req.query.days as string) || 30;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Project ID is required' },
        });
      }

      // Validate days range
      if (days < 7 || days > 90) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Days must be between 7 and 90' },
        });
      }

      // Verify user has access to project
      const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have access to this project' },
        });
      }

      const data = await ReportsService.getTasksOverTime(projectId, days);

      return res.json({
        success: true,
        data: { tasksOverTime: data },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get tasks over time report');
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve report' },
      });
    }
  }

  /**
   * GET /projects/:projectId/reports/tasks-by-status
   * Get tasks grouped by status (column)
   */
  static async getTasksByStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const userId = req.user!.id;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Project ID is required' },
        });
      }

      // Verify user has access to project
      const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have access to this project' },
        });
      }

      const data = await ReportsService.getTasksByStatus(projectId);

      return res.json({
        success: true,
        data: { tasksByStatus: data },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get tasks by status report');
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve report' },
      });
    }
  }

  /**
   * GET /projects/:projectId/reports/tasks-by-assignee
   * Get tasks grouped by assignee
   */
  static async getTasksByAssignee(req: AuthenticatedRequest, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const userId = req.user!.id;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Project ID is required' },
        });
      }

      // Verify user has access to project
      const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have access to this project' },
        });
      }

      const data = await ReportsService.getTasksByAssignee(projectId);

      return res.json({
        success: true,
        data: { tasksByAssignee: data },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get tasks by assignee report');
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve report' },
      });
    }
  }

  /**
   * GET /projects/:projectId/reports/tasks-by-priority
   * Get tasks grouped by priority
   */
  static async getTasksByPriority(req: AuthenticatedRequest, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const userId = req.user!.id;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Project ID is required' },
        });
      }

      // Verify user has access to project
      const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have access to this project' },
        });
      }

      const data = await ReportsService.getTasksByPriority(projectId);

      return res.json({
        success: true,
        data: { tasksByPriority: data },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get tasks by priority report');
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve report' },
      });
    }
  }

  /**
   * GET /projects/:projectId/reports/completion-metrics
   * Get completion metrics for a project
   */
  static async getCompletionMetrics(req: AuthenticatedRequest, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const userId = req.user!.id;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Project ID is required' },
        });
      }

      // Verify user has access to project
      const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have access to this project' },
        });
      }

      const data = await ReportsService.getCompletionMetrics(projectId);

      return res.json({
        success: true,
        data: { completionMetrics: data },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get completion metrics');
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve report' },
      });
    }
  }
}
