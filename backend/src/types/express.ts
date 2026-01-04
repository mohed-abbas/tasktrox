import type { Request } from 'express';
import type { User } from '@prisma/client';

// User type without password for authenticated requests
export type SafeUser = Omit<User, 'password'>;

// Extended Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

// Extend Express Request globally
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends Omit<import('@prisma/client').User, 'password'> {}
  }
}
