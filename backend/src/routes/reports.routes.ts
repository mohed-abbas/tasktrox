import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /projects/:projectId/reports/tasks-over-time - Tasks created/completed over time
router.get(
  '/projects/:projectId/reports/tasks-over-time',
  ReportsController.getTasksOverTime
);

// GET /projects/:projectId/reports/tasks-by-status - Tasks by status (column)
router.get(
  '/projects/:projectId/reports/tasks-by-status',
  ReportsController.getTasksByStatus
);

// GET /projects/:projectId/reports/tasks-by-assignee - Tasks by assignee
router.get(
  '/projects/:projectId/reports/tasks-by-assignee',
  ReportsController.getTasksByAssignee
);

// GET /projects/:projectId/reports/tasks-by-priority - Tasks by priority
router.get(
  '/projects/:projectId/reports/tasks-by-priority',
  ReportsController.getTasksByPriority
);

// GET /projects/:projectId/reports/completion-metrics - Completion metrics
router.get(
  '/projects/:projectId/reports/completion-metrics',
  ReportsController.getCompletionMetrics
);

export default router;
