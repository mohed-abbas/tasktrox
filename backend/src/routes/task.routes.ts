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
  listProjectTasksSchema,
  createProjectTaskSchema,
  getProjectTaskSchema,
  updateProjectTaskSchema,
  deleteProjectTaskSchema,
  moveProjectTaskSchema,
} from '../validators/task.validator.js';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// ============ PROJECT-SCOPED TASK ROUTES ============
// These routes allow operating on tasks through the project endpoint

/**
 * GET /projects/:projectId/tasks
 * List all tasks for a project (across all columns)
 */
router.get('/projects/:projectId/tasks', validate(listProjectTasksSchema), TaskController.listByProject);

/**
 * POST /projects/:projectId/tasks
 * Create a new task in a project (columnId in body)
 */
router.post('/projects/:projectId/tasks', validate(createProjectTaskSchema), TaskController.createInProject);

/**
 * GET /projects/:projectId/tasks/:taskId
 * Get a single task by ID (validates task belongs to project)
 */
router.get('/projects/:projectId/tasks/:taskId', validate(getProjectTaskSchema), TaskController.get);

/**
 * PATCH /projects/:projectId/tasks/:taskId
 * Update a task
 */
router.patch('/projects/:projectId/tasks/:taskId', validate(updateProjectTaskSchema), TaskController.update);

/**
 * DELETE /projects/:projectId/tasks/:taskId
 * Soft delete a task
 */
router.delete('/projects/:projectId/tasks/:taskId', validate(deleteProjectTaskSchema), TaskController.delete);

/**
 * PATCH /projects/:projectId/tasks/:taskId/move
 * Move a task to a different column and/or position
 */
router.patch('/projects/:projectId/tasks/:taskId/move', validate(moveProjectTaskSchema), TaskController.move);

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
