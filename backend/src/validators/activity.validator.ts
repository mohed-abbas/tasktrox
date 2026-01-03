import { z } from 'zod';

// ============ PARAM SCHEMAS ============

export const projectIdParamSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

export const taskIdParamSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
});

export const projectTaskIdParamSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  taskId: z.string().min(1, 'Task ID is required'),
});

// ============ QUERY SCHEMAS ============

export const paginationQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
});

// ============ COMBINED SCHEMAS FOR VALIDATION ============

export const listProjectActivitiesSchema = z.object({
  params: projectIdParamSchema,
  query: paginationQuerySchema,
});

export const listTaskActivitiesSchema = z.object({
  params: projectTaskIdParamSchema,
  query: paginationQuerySchema,
});

export const listUserActivitiesSchema = z.object({
  query: paginationQuerySchema,
});

// ============ TYPE EXPORTS ============

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
