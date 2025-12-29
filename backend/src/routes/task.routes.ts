import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  listTasksSchema,
  createTaskSchema,
  getTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  moveTaskSchema,
  reorderTaskSchema,
  bulkDeleteSchema,
} from '../validators/task.validator.js';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// ============ COLUMN-SCOPED TASK ROUTES ============
// These are for listing and creating tasks in a column

/**
 * GET /columns/:columnId/tasks
 * List all tasks for a column
 * Query: ?includeDeleted=true to include soft-deleted tasks
 * Query: ?priority=HIGH|MEDIUM|LOW to filter by priority
 * Query: ?search=term to search by title/description
 */
router.get('/columns/:columnId/tasks', validate(listTasksSchema), TaskController.list);

/**
 * POST /columns/:columnId/tasks
 * Create a new task in a column
 */
router.post('/columns/:columnId/tasks', validate(createTaskSchema), TaskController.create);

// ============ TASK-SPECIFIC ROUTES ============
// These operate on individual tasks by ID

/**
 * POST /tasks/bulk-delete
 * Bulk soft delete multiple tasks
 * Note: Must be before /tasks/:taskId to avoid matching
 */
router.post('/tasks/bulk-delete', validate(bulkDeleteSchema), TaskController.bulkDelete);

/**
 * GET /tasks/:taskId
 * Get a single task by ID
 */
router.get('/tasks/:taskId', validate(getTaskSchema), TaskController.get);

/**
 * PATCH /tasks/:taskId
 * Update a task
 */
router.patch('/tasks/:taskId', validate(updateTaskSchema), TaskController.update);

/**
 * DELETE /tasks/:taskId
 * Soft delete a task
 */
router.delete('/tasks/:taskId', validate(deleteTaskSchema), TaskController.delete);

/**
 * PATCH /tasks/:taskId/move
 * Move a task to a different column and/or position
 */
router.patch('/tasks/:taskId/move', validate(moveTaskSchema), TaskController.move);

/**
 * PATCH /tasks/:taskId/reorder
 * Reorder a task within its column
 */
router.patch('/tasks/:taskId/reorder', validate(reorderTaskSchema), TaskController.reorder);

export default router;
