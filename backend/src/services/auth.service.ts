import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import type { User } from '@prisma/client';

// Use validated environment variables - no fallbacks (fail-fast on startup)
const JWT_SECRET = env.JWT_SECRET;
const JWT_ACCESS_EXPIRES_IN = env.JWT_ACCESS_EXPIRES_IN;
const REFRESH_TOKEN_TTL_DAYS = 7;

interface TokenPayload {
  userId: string;
  email: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate access token
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  // Generate refresh token
  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  // Generate tokens pair
  static async generateTokens(user: User): Promise<Tokens> {
    const accessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = this.generateRefreshToken();

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  // Verify access token
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  // Refresh tokens
  static async refreshTokens(refreshToken: string): Promise<Tokens | null> {
    // Find the refresh token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Token not found or expired
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      return null;
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    if (!user) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return null;
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    return this.generateTokens(user);
  }

  // Revoke refresh token
  static async revokeRefreshToken(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  // Revoke all refresh tokens for user
  static async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  // Register new user
  static async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User; tokens: Tokens }> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: 'local',
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  // Login user
  static async login(email: string, password: string): Promise<{ user: User; tokens: Tokens }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await this.verifyPassword(password, user.password);

    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  // Find or create OAuth user
  static async findOrCreateOAuthUser(
    provider: string,
    providerId: string,
    email: string,
    name: string,
    avatar?: string
  ): Promise<{ user: User; tokens: Tokens }> {
    // Try to find existing user by provider ID
    let user = await prisma.user.findFirst({
      where: {
        provider,
        providerId,
      },
    });

    if (!user) {
      // Try to find by email
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Link OAuth to existing account
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider,
            providerId,
            avatar: avatar || user.avatar,
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name,
            provider,
            providerId,
            avatar,
          },
        });
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // Generate password reset token
  static async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = 60 * 60; // 1 hour

    // Store in Redis
    await redis.setex(`password_reset:${token}`, expiry, user.id);

    return token;
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const userId = await redis.get(`password_reset:${token}`);

    if (!userId) {
      return false;
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Delete the reset token
    await redis.del(`password_reset:${token}`);

    // Revoke all refresh tokens for security
    await this.revokeAllUserTokens(userId);

    return true;
  }

  // Clean up expired refresh tokens
  static async cleanupExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}

export default AuthService;
