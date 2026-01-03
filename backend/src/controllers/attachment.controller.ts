import type { Request, Response, NextFunction } from 'express';
import { AttachmentService } from '../services/attachment.service.js';
import { ActivityService, ActivityAction } from '../services/activity.service.js';
import { broadcastAttachmentUploaded, broadcastAttachmentDeleted } from '../sockets/broadcast.js';
import { handleUploadError } from '../middleware/upload.middleware.js';
import type { AttachmentParams, AttachmentIdParams, DownloadParams } from '../validators/attachment.validator.js';
import type { LiveAttachment } from '../types/presence.js';

export class AttachmentController {
  /**
   * GET /projects/:projectId/tasks/:taskId/attachments
   * List all attachments for a task
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { projectId, taskId } = req.params as unknown as AttachmentParams;

      const attachments = await AttachmentService.getTaskAttachments(
        projectId,
        taskId,
        userId
      );

      if (attachments === null) {
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
        data: { attachments },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/:projectId/tasks/:taskId/attachments
   * Upload an attachment to a task
   */
  static async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { projectId, taskId } = req.params as unknown as AttachmentParams;

      // Check if storage is configured
      if (!AttachmentService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: {
            code: 'STORAGE_NOT_CONFIGURED',
            message: 'File storage is not configured',
          },
        });
        return;
      }

      // Check if file was provided
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file provided',
          },
        });
        return;
      }

      const attachment = await AttachmentService.upload({
        projectId,
        taskId,
        userId,
        file: {
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      });

      if (attachment === null) {
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
        action: ActivityAction.ATTACHMENT_UPLOADED,
        projectId,
        userId,
        taskId,
        metadata: {
          attachmentName: attachment.originalName,
          attachmentId: attachment.id,
        },
      });

      // Broadcast attachment uploaded event
      const liveAttachment: LiveAttachment = {
        id: attachment.id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        url: attachment.url,
        size: attachment.size,
        mimeType: attachment.mimeType,
        taskId: attachment.taskId,
        uploadedById: attachment.uploadedById,
        createdAt: attachment.createdAt.toISOString(),
        uploadedBy: attachment.uploadedBy,
      };
      broadcastAttachmentUploaded(projectId, liveAttachment, userId);

      res.status(201).json({
        success: true,
        data: { attachment },
      });
    } catch (error) {
      // Handle multer errors
      if (error instanceof Error) {
        const uploadError = handleUploadError(error);
        res.status(400).json({
          success: false,
          error: uploadError,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /projects/:projectId/attachments/:attachmentId
   * Delete an attachment
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { projectId, attachmentId } = req.params as unknown as AttachmentIdParams;

      // Get attachment info for activity logging
      const attachment = await AttachmentService.getById(attachmentId, userId);
      const attachmentName = attachment?.originalName;

      const result = await AttachmentService.delete(attachmentId, userId);

      if (!result.success) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Attachment not found or you do not have permission',
          },
        });
        return;
      }

      // Log activity and broadcast event
      if (result.taskId) {
        ActivityService.logAsync({
          action: ActivityAction.ATTACHMENT_DELETED,
          projectId,
          userId,
          taskId: result.taskId,
          metadata: {
            attachmentName,
            attachmentId,
          },
        });

        // Broadcast attachment deleted event
        broadcastAttachmentDeleted(projectId, attachmentId, result.taskId, userId);
      }

      res.json({
        success: true,
        data: { message: 'Attachment deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /attachments/:attachmentId/download
   * Get a signed URL to download an attachment
   */
  static async download(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { attachmentId } = req.params as unknown as DownloadParams;

      const downloadUrl = await AttachmentService.getDownloadUrl(attachmentId, userId);

      if (!downloadUrl) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Attachment not found or you do not have access',
          },
        });
        return;
      }

      // Redirect to signed URL
      res.redirect(downloadUrl);
    } catch (error) {
      next(error);
    }
  }
}

export default AttachmentController;
