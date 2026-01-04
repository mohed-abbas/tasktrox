import { z } from 'zod';

/**
 * Path parameters for attachment routes
 */
export const attachmentParamsSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    taskId: z.string().min(1, 'Task ID is required'),
  }),
});

export const attachmentIdParamsSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    attachmentId: z.string().min(1, 'Attachment ID is required'),
  }),
});

export const downloadParamsSchema = z.object({
  params: z.object({
    attachmentId: z.string().min(1, 'Attachment ID is required'),
  }),
});

export type AttachmentParams = z.infer<typeof attachmentParamsSchema>['params'];
export type AttachmentIdParams = z.infer<typeof attachmentIdParamsSchema>['params'];
export type DownloadParams = z.infer<typeof downloadParamsSchema>['params'];
