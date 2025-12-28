import { Router, type Request, type Response } from 'express';

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

// Route modules will be added here
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/projects', projectRoutes);
// router.use('/tasks', taskRoutes);

export default router;
