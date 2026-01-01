import { z } from 'zod';

// ============ PARAM SCHEMAS ============

export const assigneeParamsSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  taskId: z.string().min(1, 'Task ID is required'),
});

export const removeAssigneeParamsSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  taskId: z.string().min(1, 'Task ID is required'),
  userId: z.string().min(1, 'User ID is required'),
});

// ============ BODY SCHEMAS ============

export const addAssigneeBodySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const setAssigneesBodySchema = z.object({
  userIds: z
    .array(z.string().min(1))
    .max(20, 'Maximum 20 assignees allowed'),
});

// ============ COMBINED SCHEMAS FOR VALIDATION ============

export const addAssigneeSchema = z.object({
  params: assigneeParamsSchema,
  body: addAssigneeBodySchema,
});

export const removeAssigneeSchema = z.object({
  params: removeAssigneeParamsSchema,
});

export const getAssigneesSchema = z.object({
  params: assigneeParamsSchema,
});

export const setAssigneesSchema = z.object({
  params: assigneeParamsSchema,
  body: setAssigneesBodySchema,
});

// ============ TYPE EXPORTS ============

export type AddAssigneeInput = z.infer<typeof addAssigneeBodySchema>;
export type SetAssigneesInput = z.infer<typeof setAssigneesBodySchema>;
