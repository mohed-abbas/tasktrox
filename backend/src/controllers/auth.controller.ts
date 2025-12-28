import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validators/auth.validator.js';

// Cookie options
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
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
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
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
      if (token) {
        // TODO: Send email with reset link
        // await sendPasswordResetEmail(email, token);
        console.log(`Password reset token for ${email}: ${token}`);
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
  static oauthCallback(req: Request, res: Response, next: NextFunction) {
    return async () => {
      try {
        if (!req.user) {
          return res.redirect(
            `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error?message=Authentication failed`
          );
        }

        const user = req.user as { id: string; email: string };
        const tokens = await AuthService.generateTokens(user as Parameters<typeof AuthService.generateTokens>[0]);

        // Set refresh token cookie
        res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

        // Redirect to frontend with access token
        res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${tokens.accessToken}`
        );
      } catch (error) {
        next(error);
      }
    };
  }
}

export default AuthController;
