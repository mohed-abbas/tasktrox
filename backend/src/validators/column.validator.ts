import { z } from 'zod';

// ============ COLUMN SCHEMAS ============

/**
 * GET /projects/:projectId/columns
 * List columns for a project
 */
export const listColumnsSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
  }),
});

/**
 * POST /projects/:projectId/columns
 * Create a new column
 */
export const createColumnSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Column name is required')
      .max(50, 'Column name must be less than 50 characters'),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
      .optional(),
    order: z.number().int().min(0).optional(), // If not provided, will be appended at end
  }),
});

/**
 * PATCH /columns/:columnId
 * Update a column (legacy route)
 */
export const updateColumnSchema = z.object({
  params: z.object({
    projectId: z.string().min(1).optional(), // Optional for legacy route
    columnId: z.string().min(1, 'Column ID is required'),
  }),
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .nullable()
      .optional(),
  }),
});

/**
 * DELETE /columns/:columnId
 * Delete a column (legacy route)
 */
export const deleteColumnSchema = z.object({
  params: z.object({
    projectId: z.string().min(1).optional(), // Optional for legacy route
    columnId: z.string().min(1, 'Column ID is required'),
  }),
});

/**
 * PATCH /columns/:columnId/reorder
 * Reorder a column within its project
 */
export const reorderColumnSchema = z.object({
  params: z.object({
    columnId: z.string().min(1, 'Column ID is required'),
  }),
  body: z.object({
    newOrder: z.number().int().min(0, 'Order must be a non-negative integer'),
  }),
});

/**
 * PATCH /projects/:projectId/columns/:columnId/reorder
 * Reorder a column within a project (project-scoped route)
 */
export const reorderProjectColumnSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    columnId: z.string().min(1, 'Column ID is required'),
  }),
  body: z.object({
    order: z.number().int().min(0, 'Order must be a non-negative integer'),
  }),
});

// ============ TYPE EXPORTS ============

export type ListColumnsParams = z.infer<typeof listColumnsSchema>['params'];
export type CreateColumnInput = z.infer<typeof createColumnSchema>['body'];
export type CreateColumnParams = z.infer<typeof createColumnSchema>['params'];
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>['body'];
export type UpdateColumnParams = z.infer<typeof updateColumnSchema>['params'];
export type DeleteColumnParams = z.infer<typeof deleteColumnSchema>['params'];
export type ReorderColumnInput = z.infer<typeof reorderColumnSchema>['body'];
export type ReorderColumnParams = z.infer<typeof reorderColumnSchema>['params'];
export type ReorderProjectColumnParams = z.infer<typeof reorderProjectColumnSchema>['params'];
export type ReorderProjectColumnInput = z.infer<typeof reorderProjectColumnSchema>['body'];
