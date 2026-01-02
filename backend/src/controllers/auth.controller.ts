import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthService } from '../services/auth.service.js';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validators/auth.validator.js';

// OAuth authorization code TTL in seconds (60 seconds = 1 minute)
const OAUTH_CODE_TTL = 60;

// Cookie options
// Use 'none' for cross-origin (Vercel frontend + Render backend)
// 'none' requires secure: true
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// Sanitize user object (remove password)
function sanitizeUser(user: { password?: string | null; [key: string]: unknown }) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export class AuthController {
  // POST /auth/register
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body as RegisterInput;

      const { user, tokens } = await AuthService.register(email, password, name);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        data: {
          user: sanitizeUser(user),
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'A user with this email already exists',
          },
        });
        return;
      }
      next(error);
    }
  }

  // POST /auth/login
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput;

      const { user, tokens } = await AuthService.login(email, password);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      res.json({
        success: true,
        data: {
          user: sanitizeUser(user),
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
        return;
      }
      next(error);
    }
  }

  // POST /auth/logout
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await AuthService.revokeRefreshToken(refreshToken);
      }

      // Clear the cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      });

      res.json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/refresh
  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get refresh token from body first (explicit), then fall back to cookie
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: {
            code: 'NO_REFRESH_TOKEN',
            message: 'No refresh token provided',
          },
        });
        return;
      }

      const tokens = await AuthService.refreshTokens(refreshToken);

      if (!tokens) {
        // Clear invalid cookie
        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
          path: '/',
        });

        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        });
        return;
      }

      // Set new refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /auth/me
  static async me(req: Request, res: Response) {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }

  // POST /auth/forgot-password
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body as ForgotPasswordInput;

      const token = await AuthService.generatePasswordResetToken(email);

      // Always return success to prevent email enumeration
      // In production, you would send an email here
      if (token && env.NODE_ENV === 'development') {
        // In development only, log a masked preview for debugging
        // Never log the full token as it could be captured in logs
        const maskedToken = token.slice(0, 8) + '...' + token.slice(-4);
        // TODO: Replace with structured logger when implementing Phase 2.1
        console.debug(`[DEV] Password reset requested for ${email}. Token preview: ${maskedToken}`);
        // TODO: Implement email service to send actual reset link
      }

      res.json({
        success: true,
        data: {
          message: 'If an account exists with this email, you will receive a password reset link',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/reset-password
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body as ResetPasswordInput;

      const success = await AuthService.resetPassword(token, password);

      if (!success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_RESET_TOKEN',
            message: 'Invalid or expired reset token',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          message: 'Password reset successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // OAuth callback handler (for Google/Apple)
  // Security: Uses authorization code pattern instead of passing tokens in URL
  static oauthCallback(req: Request, res: Response, next: NextFunction) {
    return async () => {
      try {
        if (!req.user) {
          return res.redirect(`${env.FRONTEND_URL}/auth/error?message=Authentication failed`);
        }

        const user = req.user as { id: string; email: string };

        // Generate a single-use authorization code (not the actual token)
        const authCode = crypto.randomBytes(32).toString('hex');

        // Store user ID with the code in Redis (60 second TTL)
        await redis.setex(`oauth_code:${authCode}`, OAUTH_CODE_TTL, user.id);

        // Redirect to frontend with authorization code (not the token)
        res.redirect(`${env.FRONTEND_URL}/auth/callback?code=${authCode}`);
      } catch (error) {
        next(error);
      }
    };
  }

  // POST /auth/oauth/exchange - Exchange authorization code for tokens
  // Security: Code can only be used once and expires after 60 seconds
  static async exchangeOAuthCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { code } = req.body;

      if (!code || typeof code !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CODE',
            message: 'Authorization code is required',
          },
        });
        return;
      }

      // Get and immediately delete the code from Redis (single-use)
      const userId = await redis.get(`oauth_code:${code}`);
      await redis.del(`oauth_code:${code}`);

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_OR_EXPIRED_CODE',
            message: 'Authorization code is invalid or has expired',
          },
        });
        return;
      }

      // Get user and generate tokens
      const user = await AuthService.getUserById(userId);

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      const tokens = await AuthService.generateTokens(user);

      // Set refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      res.json({
        success: true,
        data: {
          user: sanitizeUser(user),
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
