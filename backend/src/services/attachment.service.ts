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
import type { Attachment, Prisma } from '@prisma/client';
import type { GlobalFilesQuery } from '../validators/attachment.validator.js';

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
 * File with relations for global files listing
 */
export type FileWithRelations = Attachment & {
  uploadedBy: {
    id: string;
    name: string;
    avatar: string | null;
  };
  task: {
    id: string;
    title: string;
  };
  project: {
    id: string;
    name: string;
    color: string;
  };
};

/**
 * MIME type category mapping for file type filtering
 */
const FILE_TYPE_MIME_MAP: Record<string, string[]> = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  spreadsheets: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
  archives: ['application/zip', 'application/x-rar-compressed', 'application/gzip', 'application/x-7z-compressed'],
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

  /**
   * Get all files from all projects the user has access to
   */
  static async getUserFiles(
    userId: string,
    options: Partial<GlobalFilesQuery> = {}
  ): Promise<{ files: FileWithRelations[]; total: number }> {
    const {
      search,
      type,
      projectId,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 100,
      offset = 0,
    } = options;

    // Build base where clause for project membership
    const projectFilter: Prisma.ProjectWhereInput = {
      members: {
        some: { userId },
      },
    };

    // Add project ID filter if specified
    if (projectId) {
      projectFilter.id = projectId;
    }

    // Build the main where clause
    const where: Prisma.AttachmentWhereInput = {
      task: {
        column: {
          project: projectFilter,
        },
      },
    };

    // Build AND conditions array for additional filters
    const andConditions: Prisma.AttachmentWhereInput[] = [];

    // Search filter (filename or original name)
    if (search) {
      andConditions.push({
        OR: [
          { filename: { contains: search, mode: 'insensitive' } },
          { originalName: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Type filter (MIME type category)
    if (type) {
      const mimeTypes = FILE_TYPE_MIME_MAP[type];
      if (mimeTypes) {
        andConditions.push({ mimeType: { in: mimeTypes } });
      } else if (type === 'other') {
        // "Other" means everything not in the defined categories
        const allKnownMimes = Object.values(FILE_TYPE_MIME_MAP).flat();
        andConditions.push({ mimeType: { notIn: allKnownMimes } });
      }
    }

    // Date range filters
    if (dateFrom) {
      andConditions.push({ createdAt: { gte: new Date(dateFrom) } });
    }
    if (dateTo) {
      andConditions.push({ createdAt: { lte: new Date(dateTo) } });
    }

    // Add AND conditions if any exist
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Build orderBy
    const orderBy: Prisma.AttachmentOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries in parallel
    const [files, total] = await Promise.all([
      prisma.attachment.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, name: true, avatar: true },
          },
          task: {
            select: {
              id: true,
              title: true,
              column: {
                select: {
                  project: {
                    select: { id: true, name: true, color: true },
                  },
                },
              },
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.attachment.count({ where }),
    ]);

    // Transform to flatten project info
    const transformedFiles = files.map((file) => ({
      ...file,
      task: {
        id: file.task.id,
        title: file.task.title,
      },
      project: file.task.column.project,
    })) as FileWithRelations[];

    return { files: transformedFiles, total };
  }
}

export default AttachmentService;
