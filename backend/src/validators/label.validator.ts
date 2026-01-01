import { z } from 'zod';

// ============ LABEL SCHEMAS ============

/**
 * Hex color regex - validates #RRGGBB format
 */
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

/**
 * GET /projects/:projectId/labels
 * List all labels for a project
 */
export const listLabelsSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
  }),
});

/**
 * POST /projects/:projectId/labels
 * Create a new label
 */
export const createLabelSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Label name is required')
      .max(50, 'Label name must be less than 50 characters'),
    color: z
      .string()
      .regex(hexColorRegex, 'Color must be a valid hex color (e.g., #FF0000)'),
  }),
});

/**
 * GET /projects/:projectId/labels/:labelId
 * Get a single label by ID
 */
export const getLabelSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    labelId: z.string().min(1, 'Label ID is required'),
  }),
});

/**
 * PATCH /projects/:projectId/labels/:labelId
 * Update a label
 */
export const updateLabelSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    labelId: z.string().min(1, 'Label ID is required'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Label name is required')
      .max(50, 'Label name must be less than 50 characters')
      .optional(),
    color: z
      .string()
      .regex(hexColorRegex, 'Color must be a valid hex color (e.g., #FF0000)')
      .optional(),
  }),
});

/**
 * DELETE /projects/:projectId/labels/:labelId
 * Delete a label
 */
export const deleteLabelSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    labelId: z.string().min(1, 'Label ID is required'),
  }),
});

// ============ TASK LABEL SCHEMAS ============

/**
 * POST /projects/:projectId/tasks/:taskId/labels
 * Add a label to a task
 */
export const addTaskLabelSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    taskId: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    labelId: z.string().min(1, 'Label ID is required'),
  }),
});

/**
 * DELETE /projects/:projectId/tasks/:taskId/labels/:labelId
 * Remove a label from a task
 */
export const removeTaskLabelSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    taskId: z.string().min(1, 'Task ID is required'),
    labelId: z.string().min(1, 'Label ID is required'),
  }),
});

/**
 * PUT /projects/:projectId/tasks/:taskId/labels
 * Replace all labels on a task (bulk update)
 */
export const setTaskLabelsSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    taskId: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    labelIds: z.array(z.string().min(1)).default([]),
  }),
});

// ============ TYPE EXPORTS ============

export type CreateLabelInput = z.infer<typeof createLabelSchema>['body'];
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>['body'];
export type AddTaskLabelInput = z.infer<typeof addTaskLabelSchema>['body'];
export type SetTaskLabelsInput = z.infer<typeof setTaskLabelsSchema>['body'];
