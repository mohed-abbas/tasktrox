import { Router, type Request, type Response } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import columnRoutes from './column.routes.js';
import taskRoutes from './task.routes.js';

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
// router.use('/users', userRoutes);

export default router;
