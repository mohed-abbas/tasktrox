import { Router } from 'express';
import { AttachmentController } from '../controllers/attachment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import {
  attachmentParamsSchema,
  attachmentIdParamsSchema,
  downloadParamsSchema,
} from '../validators/attachment.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /projects/:projectId/tasks/:taskId/attachments - List task attachments
router.get(
  '/projects/:projectId/tasks/:taskId/attachments',
  validate(attachmentParamsSchema),
  AttachmentController.list
);

// POST /projects/:projectId/tasks/:taskId/attachments - Upload attachment
router.post(
  '/projects/:projectId/tasks/:taskId/attachments',
  validate(attachmentParamsSchema),
  uploadSingle,
  AttachmentController.upload
);

// DELETE /projects/:projectId/attachments/:attachmentId - Delete attachment
router.delete(
  '/projects/:projectId/attachments/:attachmentId',
  validate(attachmentIdParamsSchema),
  AttachmentController.delete
);

// GET /attachments/:attachmentId/download - Download attachment (redirect to signed URL)
router.get(
  '/attachments/:attachmentId/download',
  validate(downloadParamsSchema),
  AttachmentController.download
);

export default router;
