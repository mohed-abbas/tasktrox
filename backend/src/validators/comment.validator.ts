import { z } from 'zod';

/**
 * Path parameters for comment routes
 */
export const commentParamsSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    taskId: z.string().min(1, 'Task ID is required'),
  }),
});

export const commentIdParamsSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    commentId: z.string().min(1, 'Comment ID is required'),
  }),
});

/**
 * Create comment body
 */
export const createCommentSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    taskId: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    content: z
      .string()
      .min(1, 'Comment content is required')
      .max(10000, 'Comment content is too long'),
  }),
});

/**
 * Update comment body
 */
export const updateCommentSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    commentId: z.string().min(1, 'Comment ID is required'),
  }),
  body: z.object({
    content: z
      .string()
      .min(1, 'Comment content is required')
      .max(10000, 'Comment content is too long'),
  }),
});

export type CommentParams = z.infer<typeof commentParamsSchema>['params'];
export type CommentIdParams = z.infer<typeof commentIdParamsSchema>['params'];
export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>['body'];
