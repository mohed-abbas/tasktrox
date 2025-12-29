import { z } from 'zod';

// ============ ENUMS ============

export const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

// ============ PARAM SCHEMAS ============

export const taskIdParamSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
});

export const columnIdParamSchema = z.object({
  columnId: z.string().min(1, 'Column ID is required'),
});

// ============ QUERY SCHEMAS ============

export const listTasksQuerySchema = z.object({
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .optional(),
  priority: priorityEnum.optional(),
  search: z.string().max(200).optional(),
});

// ============ BODY SCHEMAS ============

export const createTaskBodySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters')
    .optional(),
  priority: priorityEnum.optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

export const updateTaskBodySchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be at most 200 characters')
    .optional(),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters')
    .nullable()
    .optional(),
  priority: priorityEnum.nullable().optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .nullable()
    .optional()
    .or(z.literal('')),
});

export const moveTaskBodySchema = z.object({
  targetColumnId: z.string().min(1, 'Target column ID is required'),
  order: z.number().int().min(0, 'Order must be a non-negative integer'),
});

export const reorderTaskBodySchema = z.object({
  order: z.number().int().min(0, 'Order must be a non-negative integer'),
});

export const bulkDeleteBodySchema = z.object({
  taskIds: z
    .array(z.string().min(1))
    .min(1, 'At least one task ID is required')
    .max(50, 'Maximum 50 tasks can be deleted at once'),
});

// ============ COMBINED SCHEMAS FOR VALIDATION ============

export const listTasksSchema = z.object({
  params: columnIdParamSchema,
  query: listTasksQuerySchema,
});

export const createTaskSchema = z.object({
  params: columnIdParamSchema,
  body: createTaskBodySchema,
});

export const getTaskSchema = z.object({
  params: taskIdParamSchema,
});

export const updateTaskSchema = z.object({
  params: taskIdParamSchema,
  body: updateTaskBodySchema,
});

export const deleteTaskSchema = z.object({
  params: taskIdParamSchema,
});

export const moveTaskSchema = z.object({
  params: taskIdParamSchema,
  body: moveTaskBodySchema,
});

export const reorderTaskSchema = z.object({
  params: taskIdParamSchema,
  body: reorderTaskBodySchema,
});

export const bulkDeleteSchema = z.object({
  body: bulkDeleteBodySchema,
});

// ============ TYPE EXPORTS ============

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type CreateTaskInput = z.infer<typeof createTaskBodySchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskBodySchema>;
export type MoveTaskInput = z.infer<typeof moveTaskBodySchema>;
export type ReorderTaskInput = z.infer<typeof reorderTaskBodySchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteBodySchema>;
