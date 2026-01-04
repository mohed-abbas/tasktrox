import { prisma } from '../config/database.js';
import { AuthService } from './auth.service.js';
import { uploadToR2, deleteFromR2, getPublicUrl, R2_PUBLIC_URL } from '../config/storage.js';
import type { User } from '@prisma/client';

// Multer file type
type MulterFile = Express.Multer.File;

// Safe user data (without password)
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  provider: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  /**
   * Convert User to SafeUser (excludes password)
   */
  static toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user ? this.toSafeUser(user) : null;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: UpdateProfileData): Promise<SafeUser> {
    // If email is being changed, check it's not already in use
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email is already in use');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
      },
    });

    return this.toSafeUser(user);
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(
    userId: string,
    file: MulterFile
  ): Promise<{ avatar: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar && user.avatar.includes('avatars/')) {
      // Extract key from URL
      const urlParts = user.avatar.split('/');
      const keyStart = urlParts.findIndex((p) => p === 'avatars');
      if (keyStart >= 0) {
        const oldKey = urlParts.slice(keyStart).join('/');
        await deleteFromR2(oldKey);
      }
    }

    // Upload new avatar
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `avatars/${userId}/${Date.now()}-${safeName}`;
    const success = await uploadToR2(key, file.buffer, file.mimetype);

    if (!success) {
      throw new Error('Failed to upload avatar');
    }

    // Get the URL for the avatar
    const avatarUrl = getPublicUrl(key) ?? `${R2_PUBLIC_URL}/${key}`;

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return { avatar: avatarUrl };
  }

  /**
   * Delete user avatar
   */
  static async deleteAvatar(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Delete from storage if exists
    if (user.avatar && user.avatar.includes('avatars/')) {
      // Extract key from URL
      const urlParts = user.avatar.split('/');
      const keyStart = urlParts.findIndex((p) => p === 'avatars');
      if (keyStart >= 0) {
        const oldKey = urlParts.slice(keyStart).join('/');
        await deleteFromR2(oldKey);
      }
    }

    // Remove avatar from user
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
    });
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, data: ChangePasswordData): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has local auth (has password)
    if (!user.password) {
      throw new Error('Cannot change password for OAuth accounts');
    }

    // Verify current password
    const isValid = await AuthService.verifyPassword(data.currentPassword, user.password);

    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash and update new password
    const hashedPassword = await AuthService.hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Revoke all refresh tokens for security
    await AuthService.revokeAllUserTokens(userId);
  }

  /**
   * Delete user account
   */
  static async deleteAccount(userId: string): Promise<void> {
    // Delete avatar from storage
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.avatar && user.avatar.includes('avatars/')) {
      // Extract key from URL
      const urlParts = user.avatar.split('/');
      const keyStart = urlParts.findIndex((p) => p === 'avatars');
      if (keyStart >= 0) {
        const oldKey = urlParts.slice(keyStart).join('/');
        await deleteFromR2(oldKey);
      }
    }

    // Revoke all tokens
    await AuthService.revokeAllUserTokens(userId);

    // Delete user (cascades to related data)
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}
