import { Router } from 'express';
import { ColumnController } from '../controllers/column.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  listColumnsSchema,
  createColumnSchema,
  updateColumnSchema,
  deleteColumnSchema,
  reorderColumnSchema,
  reorderProjectColumnSchema,
} from '../validators/column.validator.js';

const router = Router();

// All column routes require authentication
router.use(authenticate);

// ============ PROJECT-SCOPED COLUMN ROUTES ============
// These are mounted under /projects/:projectId/columns in index.ts

/**
 * GET /projects/:projectId/columns
 * List all columns for a project
 * Query: ?includeTasks=true to include tasks in response
 */
router.get(
  '/projects/:projectId/columns',
  validate(listColumnsSchema),
  ColumnController.list
);

/**
 * POST /projects/:projectId/columns
 * Create a new column in a project
 */
router.post(
  '/projects/:projectId/columns',
  validate(createColumnSchema),
  ColumnController.create
);

/**
 * PATCH /projects/:projectId/columns/:columnId
 * Update a column (project-scoped route)
 */
router.patch(
  '/projects/:projectId/columns/:columnId',
  validate(updateColumnSchema),
  ColumnController.update
);

/**
 * DELETE /projects/:projectId/columns/:columnId
 * Delete a column (project-scoped route)
 * Query: ?moveTasksTo=<columnId> to move tasks before deletion
 */
router.delete(
  '/projects/:projectId/columns/:columnId',
  validate(deleteColumnSchema),
  ColumnController.delete
);

/**
 * PATCH /projects/:projectId/columns/:columnId/reorder
 * Reorder a column within a project (project-scoped route)
 */
router.patch(
  '/projects/:projectId/columns/:columnId/reorder',
  validate(reorderProjectColumnSchema),
  ColumnController.reorderInProject
);

// ============ COLUMN-SPECIFIC ROUTES (Legacy/Direct Access) ============
// These operate on individual columns by ID without project scope

/**
 * GET /columns/:columnId
 * Get a single column by ID
 */
router.get('/columns/:columnId', validate(deleteColumnSchema), ColumnController.get);

/**
 * PATCH /columns/:columnId
 * Update a column (legacy route - prefer project-scoped version)
 */
router.patch('/columns/:columnId', validate(updateColumnSchema), ColumnController.update);

/**
 * DELETE /columns/:columnId
 * Delete a column (legacy route - prefer project-scoped version)
 * Query: ?moveTasksTo=<columnId> to move tasks before deletion
 */
router.delete('/columns/:columnId', validate(deleteColumnSchema), ColumnController.delete);

/**
 * PATCH /columns/:columnId/reorder
 * Reorder a column within its project (legacy route)
 */
router.patch(
  '/columns/:columnId/reorder',
  validate(reorderColumnSchema),
  ColumnController.reorder
);

export default router;
