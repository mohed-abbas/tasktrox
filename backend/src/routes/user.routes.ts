import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { avatarUpload } from '../middleware/upload.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /users/me - Get current user profile
router.get('/me', UserController.getMe);

// PATCH /users/me - Update current user profile
router.patch('/me', UserController.updateProfile);

// POST /users/me/avatar - Upload user avatar
router.post('/me/avatar', avatarUpload.single('avatar'), UserController.uploadAvatar);

// DELETE /users/me/avatar - Delete user avatar
router.delete('/me/avatar', UserController.deleteAvatar);

// PATCH /users/me/password - Change user password
router.patch('/me/password', UserController.changePassword);

// DELETE /users/me - Delete user account
router.delete('/me', UserController.deleteAccount);

export default router;
