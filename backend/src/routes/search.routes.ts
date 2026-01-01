import { Router } from 'express';
import * as searchController from '../controllers/search.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { searchQuerySchema } from '../validators/search.validator.js';

const router = Router();

// All search routes require authentication
router.use(authenticate);

// GET /api/v1/search?q=query&projectId=optional&limit=10
router.get('/', validate(searchQuerySchema), searchController.search);

export default router;
