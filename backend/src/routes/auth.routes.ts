import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authRateLimiter, passwordResetRateLimiter } from '../middleware/rate-limiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';
import { env } from '../config/env.js';

const router = Router();

// Public routes

// POST /auth/register - Register new user
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  AuthController.register
);

// POST /auth/login - Login with email/password
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  AuthController.login
);

// POST /auth/logout - Logout user
router.post('/logout', AuthController.logout);

// POST /auth/refresh - Refresh access token
router.post('/refresh', AuthController.refresh);

// POST /auth/oauth/exchange - Exchange OAuth authorization code for tokens
router.post('/oauth/exchange', AuthController.exchangeOAuthCode);

// POST /auth/forgot-password - Request password reset
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);

// POST /auth/reset-password - Reset password with token
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

// Protected routes

// GET /auth/me - Get current user
router.get('/me', authenticate, AuthController.me);

// OAuth routes

// GET /auth/google - Start Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// GET /auth/google/callback - Google OAuth callback
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      session: false,
    }, (err: Error | null, user: Express.User | false | null) => {
      if (err || !user) {
        // Redirect to frontend error page on authentication failure
        return res.redirect(`${env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(err?.message || 'Authentication failed')}`);
      }
      // Attach user to request for the callback handler
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req, res, next) => {
    const handler = AuthController.oauthCallback(req, res, next);
    await handler();
  }
);

// Apple OAuth routes (if configured)
// GET /auth/apple - Start Apple OAuth
// router.get('/apple', passport.authenticate('apple'));

// GET /auth/apple/callback - Apple OAuth callback
// router.post('/apple/callback', passport.authenticate('apple'), AuthController.oauthCallback);

// ============ DEVELOPMENT ONLY ============
// POST /auth/dev/oauth-test - Simulate OAuth login (dev only)
if (process.env.NODE_ENV === 'development') {
  router.post('/dev/oauth-test', async (req, res, next) => {
    try {
      const { AuthService } = await import('../services/auth.service.js');

      const { provider, providerId, email, name, avatar } = req.body;

      // Validate required fields
      if (!provider || !providerId || !email || !name) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: provider, providerId, email, name',
          },
        });
        return;
      }

      const { user, tokens } = await AuthService.findOrCreateOAuthUser(
        provider,
        providerId,
        email,
        name,
        avatar
      );

      // Set refresh token cookie
      // Use 'none' for cross-origin (Vercel frontend + Render backend)
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      // Remove password from response
      const { password: _password, ...safeUser } = user;

      res.status(201).json({
        success: true,
        data: {
          user: safeUser,
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  });
}

export default router;
