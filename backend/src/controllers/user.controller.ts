import type { Response } from 'express';
import { UserService } from '../services/user.service.js';
import type { AuthenticatedRequest } from '../types/express.js';
import { logger } from '../config/logger.js';
import { z } from 'zod';

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export class UserController {
  /**
   * GET /users/me
   * Get current user profile
   */
  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const user = await UserService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
        });
      }

      return res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get user profile');
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get profile' },
      });
    }
  }

  /**
   * PATCH /users/me
   * Update current user profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Validate input
      const validation = updateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validation.error.issues,
          },
        });
      }

      const { name, email } = validation.data;

      if (!name && !email) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'At least one field is required' },
        });
      }

      const user = await UserService.updateProfile(userId, { name, email });

      return res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';

      if (message === 'Email is already in use') {
        return res.status(409).json({
          success: false,
          error: { code: 'CONFLICT', message },
        });
      }

      logger.error({ error }, 'Failed to update user profile');
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' },
      });
    }
  }

  /**
   * POST /users/me/avatar
   * Upload user avatar
   */
  static async uploadAvatar(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'No file uploaded' },
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP',
          },
        });
      }

      // Max size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'File too large. Maximum: 5MB' },
        });
      }

      const result = await UserService.uploadAvatar(userId, file);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to upload avatar');
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to upload avatar' },
      });
    }
  }

  /**
   * DELETE /users/me/avatar
   * Delete user avatar
   */
  static async deleteAvatar(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      await UserService.deleteAvatar(userId);

      return res.json({
        success: true,
        data: { message: 'Avatar deleted successfully' },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to delete avatar');
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete avatar' },
      });
    }
  }

  /**
   * PATCH /users/me/password
   * Change user password
   */
  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Validate input
      const validation = changePasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validation.error.issues,
          },
        });
      }

      const { currentPassword, newPassword } = validation.data;

      await UserService.changePassword(userId, { currentPassword, newPassword });

      return res.json({
        success: true,
        data: { message: 'Password changed successfully' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';

      if (message === 'Current password is incorrect') {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message },
        });
      }

      if (message === 'Cannot change password for OAuth accounts') {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message },
        });
      }

      logger.error({ error }, 'Failed to change password');
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to change password' },
      });
    }
  }

  /**
   * DELETE /users/me
   * Delete user account
   */
  static async deleteAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      await UserService.deleteAccount(userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return res.json({
        success: true,
        data: { message: 'Account deleted successfully' },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to delete account');
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete account' },
      });
    }
  }
}
