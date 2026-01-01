import { Router } from 'express';
import { AssigneeController } from '../controllers/assignee.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getAssigneesSchema,
  addAssigneeSchema,
  removeAssigneeSchema,
  setAssigneesSchema,
} from '../validators/assignee.validator.js';
import { z } from 'zod';

const router = Router();

// All assignee routes require authentication
router.use(authenticate);

// ============ PROJECT MEMBER ROUTES ============

/**
 * GET /projects/:projectId/members/assignable
 * Get all project members available for task assignment
 */
router.get(
  '/projects/:projectId/members/assignable',
  validate(z.object({ params: z.object({ projectId: z.string().min(1) }) })),
  AssigneeController.getAvailable
);

// ============ TASK ASSIGNEE ROUTES ============

/**
 * GET /projects/:projectId/tasks/:taskId/assignees
 * Get all assignees for a task
 */
router.get(
  '/projects/:projectId/tasks/:taskId/assignees',
  validate(getAssigneesSchema),
  AssigneeController.list
);

/**
 * POST /projects/:projectId/tasks/:taskId/assignees
 * Add an assignee to a task
 */
router.post(
  '/projects/:projectId/tasks/:taskId/assignees',
  validate(addAssigneeSchema),
  AssigneeController.add
);

/**
 * PUT /projects/:projectId/tasks/:taskId/assignees
 * Set all assignees for a task (replace)
 */
router.put(
  '/projects/:projectId/tasks/:taskId/assignees',
  validate(setAssigneesSchema),
  AssigneeController.set
);

/**
 * DELETE /projects/:projectId/tasks/:taskId/assignees/:userId
 * Remove an assignee from a task
 */
router.delete(
  '/projects/:projectId/tasks/:taskId/assignees/:userId',
  validate(removeAssigneeSchema),
  AssigneeController.remove
);

export default router;
