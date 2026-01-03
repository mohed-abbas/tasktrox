/**
 * Attachment Service
 *
 * Handles file attachment operations for tasks.
 * Uses Cloudflare R2 for storage.
 */

import { prisma } from '../config/database.js';
import {
  uploadToR2,
  deleteFromR2,
  getSignedDownloadUrl,
  generateStorageKey,
  isStorageConfigured,
} from '../config/storage.js';
import { ProjectService } from './project.service.js';
import type { Attachment } from '@prisma/client';

/**
 * Attachment with uploader info
 */
export type AttachmentWithUploader = Attachment & {
  uploadedBy: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

/**
 * Input for uploading an attachment
 */
export interface UploadAttachmentInput {
  projectId: string;
  taskId: string;
  userId: string;
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

export class AttachmentService {
  /**
   * Check if storage is configured
   */
  static isConfigured(): boolean {
    return isStorageConfigured;
  }

  /**
   * Upload an attachment to a task
   */
  static async upload(input: UploadAttachmentInput): Promise<AttachmentWithUploader | null> {
    // Check project access
    const hasAccess = await ProjectService.checkProjectAccess(input.projectId, input.userId);
    if (!hasAccess) {
      return null;
    }

    // Verify task belongs to project
    const task = await prisma.task.findFirst({
      where: {
        id: input.taskId,
        column: {
          projectId: input.projectId,
        },
      },
    });

    if (!task) {
      return null;
    }

    // Generate storage key
    const storageKey = generateStorageKey(
      input.projectId,
      input.taskId,
      input.file.originalname
    );

    // Upload to R2
    const uploaded = await uploadToR2(
      storageKey,
      input.file.buffer,
      input.file.mimetype
    );

    if (!uploaded) {
      throw new Error('Failed to upload file to storage');
    }

    // Create attachment record
    const attachment = await prisma.attachment.create({
      data: {
        filename: storageKey,
        originalName: input.file.originalname,
        url: storageKey, // Store key, generate URL on demand
        size: input.file.size,
        mimeType: input.file.mimetype,
        taskId: input.taskId,
        uploadedById: input.userId,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return attachment as AttachmentWithUploader;
  }

  /**
   * Get all attachments for a task
   */
  static async getTaskAttachments(
    projectId: string,
    taskId: string,
    userId: string
  ): Promise<AttachmentWithUploader[] | null> {
    // Check project access
    const hasAccess = await ProjectService.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    // Verify task belongs to project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        column: {
          projectId,
        },
      },
    });

    if (!task) {
      return null;
    }

    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return attachments as AttachmentWithUploader[];
  }

  /**
   * Get a single attachment by ID
   */
  static async getById(
    attachmentId: string,
    userId: string
  ): Promise<AttachmentWithUploader | null> {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatar: true },
        },
        task: {
          select: {
            column: {
              select: { projectId: true },
            },
          },
        },
      },
    });

    if (!attachment) {
      return null;
    }

    // Check project access
    const hasAccess = await ProjectService.checkProjectAccess(
      attachment.task.column.projectId,
      userId
    );
    if (!hasAccess) {
      return null;
    }

    return attachment as AttachmentWithUploader;
  }

  /**
   * Get a signed download URL for an attachment
   */
  static async getDownloadUrl(
    attachmentId: string,
    userId: string
  ): Promise<string | null> {
    const attachment = await this.getById(attachmentId, userId);
    if (!attachment) {
      return null;
    }

    return getSignedDownloadUrl(attachment.filename);
  }

  /**
   * Delete an attachment
   */
  static async delete(
    attachmentId: string,
    userId: string
  ): Promise<{ success: boolean; taskId?: string; projectId?: string }> {
    // Get attachment with project info
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          select: {
            id: true,
            column: {
              select: { projectId: true },
            },
          },
        },
      },
    });

    if (!attachment) {
      return { success: false };
    }

    // Check project access
    const hasAccess = await ProjectService.checkProjectAccess(
      attachment.task.column.projectId,
      userId
    );
    if (!hasAccess) {
      return { success: false };
    }

    // Delete from R2
    await deleteFromR2(attachment.filename);

    // Delete from database
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return {
      success: true,
      taskId: attachment.task.id,
      projectId: attachment.task.column.projectId,
    };
  }

  /**
   * Get attachment count for a task
   */
  static async getTaskAttachmentCount(taskId: string): Promise<number> {
    return prisma.attachment.count({
      where: { taskId },
    });
  }
}

export default AttachmentService;
