import { Router } from 'express';
import { LabelController } from '../controllers/label.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  listLabelsSchema,
  createLabelSchema,
  getLabelSchema,
  updateLabelSchema,
  deleteLabelSchema,
  addTaskLabelSchema,
  removeTaskLabelSchema,
  setTaskLabelsSchema,
} from '../validators/label.validator.js';

const router = Router();

// All label routes require authentication
router.use(authenticate);

// ============ PROJECT LABEL ROUTES ============

/**
 * GET /projects/:projectId/labels
 * List all labels for a project
 */
router.get(
  '/projects/:projectId/labels',
  validate(listLabelsSchema),
  LabelController.list
);

/**
 * POST /projects/:projectId/labels
 * Create a new label
 */
router.post(
  '/projects/:projectId/labels',
  validate(createLabelSchema),
  LabelController.create
);

/**
 * GET /projects/:projectId/labels/:labelId
 * Get a single label by ID
 */
router.get(
  '/projects/:projectId/labels/:labelId',
  validate(getLabelSchema),
  LabelController.get
);

/**
 * PATCH /projects/:projectId/labels/:labelId
 * Update a label
 */
router.patch(
  '/projects/:projectId/labels/:labelId',
  validate(updateLabelSchema),
  LabelController.update
);

/**
 * DELETE /projects/:projectId/labels/:labelId
 * Delete a label
 */
router.delete(
  '/projects/:projectId/labels/:labelId',
  validate(deleteLabelSchema),
  LabelController.delete
);

// ============ TASK LABEL ROUTES ============

/**
 * GET /projects/:projectId/tasks/:taskId/labels
 * Get all labels for a task
 */
router.get(
  '/projects/:projectId/tasks/:taskId/labels',
  validate(addTaskLabelSchema.pick({ params: true })),
  LabelController.getTaskLabels
);

/**
 * POST /projects/:projectId/tasks/:taskId/labels
 * Add a label to a task
 */
router.post(
  '/projects/:projectId/tasks/:taskId/labels',
  validate(addTaskLabelSchema),
  LabelController.addToTask
);

/**
 * PUT /projects/:projectId/tasks/:taskId/labels
 * Replace all labels on a task
 */
router.put(
  '/projects/:projectId/tasks/:taskId/labels',
  validate(setTaskLabelsSchema),
  LabelController.setTaskLabels
);

/**
 * DELETE /projects/:projectId/tasks/:taskId/labels/:labelId
 * Remove a label from a task
 */
router.delete(
  '/projects/:projectId/tasks/:taskId/labels/:labelId',
  validate(removeTaskLabelSchema),
  LabelController.removeFromTask
);

export default router;
