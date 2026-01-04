import type { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service.js';
import { ActivityService, ActivityAction } from '../services/activity.service.js';
import { broadcastCommentCreated, broadcastCommentUpdated, broadcastCommentDeleted } from '../sockets/broadcast.js';
import type {
  CommentParams,
  CommentIdParams,
  CreateCommentInput,
  UpdateCommentInput,
} from '../validators/comment.validator.js';
import type { LiveComment } from '../types/presence.js';

export class CommentController {
  /**
   * GET /projects/:projectId/tasks/:taskId/comments
   * List all comments for a task
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { projectId, taskId } = req.params as unknown as CommentParams;

      const comments = await CommentService.getTaskComments(projectId, taskId, userId);

      if (comments === null) {
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
        data: { comments },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/:projectId/tasks/:taskId/comments
   * Create a new comment on a task
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { projectId, taskId } = req.params as unknown as CommentParams;
      const { content } = req.body as CreateCommentInput;

      const comment = await CommentService.create({
        projectId,
        taskId,
        userId,
        content,
      });

      if (comment === null) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Task or project not found, or you do not have permission',
          },
        });
        return;
      }

      // Log activity
      ActivityService.logAsync({
        action: ActivityAction.COMMENT_CREATED,
        projectId,
        userId,
        taskId,
        metadata: {
          commentId: comment.id,
          commentPreview: content.slice(0, 100),
        },
      });

      // Broadcast comment created event
      const liveComment: LiveComment = {
        id: comment.id,
        content: comment.content,
        taskId: comment.taskId,
        userId: comment.userId,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        user: comment.user,
      };
      broadcastCommentCreated(projectId, liveComment, userId);

      res.status(201).json({
        success: true,
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /projects/:projectId/comments/:commentId
   * Update a comment
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { projectId, commentId } = req.params as unknown as CommentIdParams;
      const { content } = req.body as UpdateCommentInput;

      const comment = await CommentService.update({
        commentId,
        userId,
        content,
      });

      if (comment === null) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Comment not found or you do not have permission to edit it',
          },
        });
        return;
      }

      // Log activity
      ActivityService.logAsync({
        action: ActivityAction.COMMENT_UPDATED,
        projectId,
        userId,
        taskId: comment.taskId,
        metadata: {
          commentId: comment.id,
        },
      });

      // Broadcast comment updated event
      const liveComment: LiveComment = {
        id: comment.id,
        content: comment.content,
        taskId: comment.taskId,
        userId: comment.userId,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        user: comment.user,
      };
      broadcastCommentUpdated(projectId, liveComment, userId);

      res.json({
        success: true,
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /projects/:projectId/comments/:commentId
   * Delete a comment
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { projectId, commentId } = req.params as unknown as CommentIdParams;

      const result = await CommentService.delete(commentId, userId);

      if (!result.success) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Comment not found or you do not have permission to delete it',
          },
        });
        return;
      }

      // Log activity
      if (result.taskId) {
        ActivityService.logAsync({
          action: ActivityAction.COMMENT_DELETED,
          projectId,
          userId,
          taskId: result.taskId,
          metadata: {
            commentId,
          },
        });

        // Broadcast comment deleted event
        broadcastCommentDeleted(projectId, commentId, result.taskId, userId);
      }

      res.json({
        success: true,
        data: { message: 'Comment deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CommentController;
