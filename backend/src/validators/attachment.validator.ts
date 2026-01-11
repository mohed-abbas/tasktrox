import { z } from 'zod';

/**
 * Query parameters for global files listing
 */
export const globalFilesQuerySchema = z.object({
  search: z.string().max(200).optional(),
  type: z.enum(['images', 'documents', 'spreadsheets', 'archives', 'other']).optional(),
  projectId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'size', 'originalName']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.string().optional()
    .transform((val) => (val ? parseInt(val, 10) : 100))
    .pipe(z.number().int().min(1).max(100)),
  offset: z.string().optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
});

export const globalFilesSchema = z.object({
  query: globalFilesQuerySchema,
});

export type GlobalFilesQuery = z.infer<typeof globalFilesQuerySchema>;

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
