import { Router, type Request, type Response } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import columnRoutes from './column.routes.js';
import taskRoutes from './task.routes.js';
import labelRoutes from './label.routes.js';
import assigneeRoutes from './assignee.routes.js';
import searchRoutes from './search.routes.js';
import activityRoutes from './activity.routes.js';

const router = Router();

// API root
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'Tasktrox API',
      version: '1.0.0',
      documentation: '/api/v1/docs',
    },
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/', columnRoutes); // Column routes handle /projects/:projectId/columns and /columns/:columnId
router.use('/', taskRoutes); // Task routes handle /columns/:columnId/tasks and /tasks/:taskId
router.use('/', labelRoutes); // Label routes handle /projects/:projectId/labels and task labels
router.use('/', assigneeRoutes); // Assignee routes handle /projects/:projectId/tasks/:taskId/assignees
router.use('/search', searchRoutes); // Search routes handle /search?q=query
router.use('/', activityRoutes); // Activity routes handle /activities/me, /projects/:projectId/activities
// router.use('/users', userRoutes);

export default router;
