import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  commentParamsSchema,
  commentIdParamsSchema,
  createCommentSchema,
  updateCommentSchema,
} from '../validators/comment.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /projects/:projectId/tasks/:taskId/comments - List task comments
router.get(
  '/projects/:projectId/tasks/:taskId/comments',
  validate(commentParamsSchema),
  CommentController.list
);

// POST /projects/:projectId/tasks/:taskId/comments - Create comment
router.post(
  '/projects/:projectId/tasks/:taskId/comments',
  validate(createCommentSchema),
  CommentController.create
);

// PATCH /projects/:projectId/comments/:commentId - Update comment
router.patch(
  '/projects/:projectId/comments/:commentId',
  validate(updateCommentSchema),
  CommentController.update
);

// DELETE /projects/:projectId/comments/:commentId - Delete comment
router.delete(
  '/projects/:projectId/comments/:commentId',
  validate(commentIdParamsSchema),
  CommentController.delete
);

export default router;
