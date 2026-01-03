import type { Request, Response, NextFunction } from 'express';
import { AssigneeService } from '../services/assignee.service.js';
import { ActivityService, ActivityAction } from '../services/activity.service.js';
import type {
  AddAssigneeInput,
  SetAssigneesInput,
} from '../validators/assignee.validator.js';

export class AssigneeController {
  /**
   * GET /projects/:projectId/tasks/:taskId/assignees
   * Get all assignees for a task
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;
      const taskId = req.params.taskId as string;

      const assignees = await AssigneeService.getTaskAssignees(
        projectId,
        taskId,
        userId
      );

      if (assignees === null) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Task or project not found, or you do not have access',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { assignees },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/:projectId/tasks/:taskId/assignees
   * Add an assignee to a task
   */
  static async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requesterId = req.user!.id;
      const projectId = req.params.projectId as string;
      const taskId = req.params.taskId as string;
      const { userId: targetUserId } = req.body as AddAssigneeInput;

      const assignee = await AssigneeService.addAssignee(
        projectId,
        taskId,
        requesterId,
        targetUserId
      );

      if (assignee === null) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Task or project not found, or you do not have permission',
          },
        });
        return;
      }

      // Log activity asynchronously
      ActivityService.logAsync({
        action: ActivityAction.ASSIGNEE_ADDED,
        projectId,
        userId: requesterId,
        taskId,
        metadata: {
          assigneeId: targetUserId,
        },
      });

      res.status(201).json({
        success: true,
        data: { assignee },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('project member')) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_USER',
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /projects/:projectId/tasks/:taskId/assignees/:userId
   * Remove an assignee from a task
   */
  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requesterId = req.user!.id;
      const projectId = req.params.projectId as string;
      const taskId = req.params.taskId as string;
      const targetUserId = req.params.userId as string;

      const success = await AssigneeService.removeAssignee(
        projectId,
        taskId,
        requesterId,
        targetUserId
      );

      if (!success) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assignment not found or you do not have permission',
          },
        });
        return;
      }

      // Log activity asynchronously
      ActivityService.logAsync({
        action: ActivityAction.ASSIGNEE_REMOVED,
        projectId,
        userId: requesterId,
        taskId,
        metadata: {
          assigneeId: targetUserId,
        },
      });

      res.json({
        success: true,
        data: { message: 'Assignee removed successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /projects/:projectId/tasks/:taskId/assignees
   * Set assignees for a task (replace all)
   */
  static async set(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requesterId = req.user!.id;
      const projectId = req.params.projectId as string;
      const taskId = req.params.taskId as string;
      const { userIds } = req.body as SetAssigneesInput;

      const assignees = await AssigneeService.setAssignees(
        projectId,
        taskId,
        requesterId,
        userIds
      );

      if (assignees === null) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Task or project not found, or you do not have permission',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { assignees },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/:projectId/members/assignable
   * Get all project members available for assignment
   */
  static async getAvailable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.projectId as string;

      const members = await AssigneeService.getAvailableAssignees(projectId, userId);

      if (members === null) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found or you do not have access',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { members },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AssigneeController;
