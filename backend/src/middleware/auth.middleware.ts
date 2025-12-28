import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import type { User } from '@prisma/client';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User extends Omit<import('@prisma/client').User, 'password'> {}
  }
}

// Safe user type without password
export type SafeUser = Omit<User, 'password'>;

// JWT authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error | null, user: User | false, info: { message: string } | undefined) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: info?.message || 'Authentication required',
          },
        });
      }

      // Remove password from user object
      const { password, ...safeUser } = user;
      req.user = safeUser as Express.User;
      next();
    }
  )(req, res, next);
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error | null, user: User | false) => {
      if (err) {
        return next(err);
      }

      if (user) {
        const { password, ...safeUser } = user;
        req.user = safeUser as Express.User;
      }

      next();
    }
  )(req, res, next);
};

// Check if user is the resource owner
export const isOwner = (getUserId: (req: Request) => string | undefined) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resourceUserId = getUserId(req);

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (resourceUserId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource',
        },
      });
      return;
    }

    next();
  };
};

export default authenticate;
