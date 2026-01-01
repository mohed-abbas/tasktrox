/**
 * Rate Limiting Middleware
 *
 * Uses Redis as the store for distributed rate limiting across multiple instances.
 * Provides layered rate limiting:
 * - Global: 1000 requests per 15 minutes for all IPs
 * - Auth endpoints: 5 requests per 15 minutes (login, register)
 * - Password reset: 3 requests per hour
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis.js';
import type { Request, Response } from 'express';

/**
 * Create a Redis-backed rate limiter
 */
function createLimiter(options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message: string;
  skipSuccessfulRequests?: boolean;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      // @ts-expect-error - ioredis call method is compatible but types don't align perfectly
      sendCommand: (...args: string[]) => redis.call(...args),
      prefix: `rl:${options.keyPrefix}:`,
    }),
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: options.message,
      },
    },
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: options.message,
        },
      });
    },
  });
}

/**
 * Global rate limiter - applies to all API requests
 * 1000 requests per 15 minutes per IP
 */
export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  keyPrefix: 'global',
  message: 'Too many requests from this IP, please try again later',
});

/**
 * Auth rate limiter - applies to login/register endpoints
 * 5 requests per 15 minutes per IP (skips successful requests)
 */
export const authRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  skipSuccessfulRequests: true,
});

/**
 * Password reset rate limiter
 * 3 requests per hour per IP
 */
export const passwordResetRateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  keyPrefix: 'password-reset',
  message: 'Too many password reset attempts. Please try again in an hour.',
});

/**
 * General API rate limiter (for non-global use)
 * 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  keyPrefix: 'api',
  message: 'Too many requests. Please slow down.',
});

export default { authRateLimiter, passwordResetRateLimiter, apiRateLimiter, globalLimiter };
