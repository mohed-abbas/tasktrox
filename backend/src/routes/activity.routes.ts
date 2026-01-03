import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  listProjectActivitiesSchema,
  listTaskActivitiesSchema,
  listUserActivitiesSchema,
} from '../validators/activity.validator.js';

const router = Router();

// All activity routes require authentication
router.use(authenticate);

// ============ USER ACTIVITIES ============

/**
 * GET /activities/me
 * List recent activities for the current user across all projects
 * Query: ?limit=20&offset=0 for pagination
 */
router.get('/activities/me', validate(listUserActivitiesSchema), ActivityController.listUserActivities);

// ============ PROJECT ACTIVITIES ============

/**
 * GET /projects/:projectId/activities
 * List all activities for a project
 * Query: ?limit=20&offset=0 for pagination
 */
router.get(
  '/projects/:projectId/activities',
  validate(listProjectActivitiesSchema),
  ActivityController.listByProject
);

// ============ TASK ACTIVITIES ============

/**
 * GET /projects/:projectId/tasks/:taskId/activities
 * List all activities for a specific task
 * Query: ?limit=20&offset=0 for pagination
 */
router.get(
  '/projects/:projectId/tasks/:taskId/activities',
  validate(listTaskActivitiesSchema),
  ActivityController.listByTask
);

export default router;
