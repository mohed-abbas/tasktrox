/**
 * CSRF Protection Middleware
 *
 * Implements double-submit cookie pattern:
 * 1. Server sets XSRF-TOKEN cookie (readable by JavaScript)
 * 2. Client must send X-CSRF-Token header matching the cookie value
 * 3. Server validates that header matches cookie
 *
 * This protects against CSRF attacks because:
 * - Attackers cannot read cookies from other domains (same-origin policy)
 * - Attackers cannot set custom headers in cross-origin requests
 *
 * Note: JWT Bearer token requests are exempt as they already provide CSRF
 * protection (tokens are not automatically sent by browsers).
 */

import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env.js';

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

// Cookie options for CSRF token
const CSRF_COOKIE_OPTIONS = {
  httpOnly: false, // Must be readable by JavaScript
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};

/**
 * Generate a new CSRF token
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Timing-safe comparison to prevent timing attacks
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Check if request uses Bearer token authentication
 * Bearer token requests are exempt from CSRF as tokens are not auto-sent
 */
function usesBearerToken(req: Request): boolean {
  const authHeader = req.headers.authorization;
  return !!authHeader && authHeader.startsWith('Bearer ');
}

/**
 * Middleware to set CSRF cookie on all responses
 * This should be applied early in the middleware chain
 */
export function setCsrfCookie(req: Request, res: Response, next: NextFunction): void {
  // Only set cookie if not already present
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS);
  }
  next();
}

/**
 * Middleware to validate CSRF token on state-changing requests
 * Should be applied to POST, PUT, PATCH, DELETE routes using cookie auth
 *
 * Safe methods (GET, HEAD, OPTIONS) are exempt as they should not cause side effects
 * Bearer token requests are exempt as they already provide CSRF protection
 */
export function validateCsrf(req: Request, res: Response, next: NextFunction): void {
  // Safe methods are exempt
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Bearer token requests are exempt (already CSRF-protected)
  if (usesBearerToken(req)) {
    return next();
  }

  // Get token from cookie and header
  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;

  // Validate both tokens exist
  if (!cookieToken) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_COOKIE_MISSING',
        message: 'CSRF cookie is missing. Please refresh the page.',
      },
    });
    return;
  }

  if (!headerToken) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token header is missing.',
      },
    });
    return;
  }

  // Validate tokens match using timing-safe comparison
  if (!safeCompare(cookieToken, headerToken)) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'CSRF token validation failed.',
      },
    });
    return;
  }

  next();
}

/**
 * Combined middleware that sets cookie and validates on state-changing requests
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // First, ensure CSRF cookie exists
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS);
    // For the current request, set it in cookies manually
    req.cookies[CSRF_COOKIE_NAME] = token;
  }

  // Then validate if needed
  validateCsrf(req, res, next);
}

export default { setCsrfCookie, validateCsrf, csrfProtection };
