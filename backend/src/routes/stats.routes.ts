import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /stats/dashboard - Get user's dashboard stats
router.get('/dashboard', StatsController.getDashboardStats);

// GET /stats/projects/:projectId - Get project-specific stats
router.get('/projects/:projectId', StatsController.getProjectStats);

export default router;
