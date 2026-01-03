/**
 * Socket.io Authentication Middleware
 *
 * Authenticates WebSocket connections using JWT tokens.
 * Extracts token from socket.handshake.auth.token and verifies it.
 * On success, attaches user data to socket.data.user.
 */

import type { Socket, ExtendedError } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { socketLogger } from '../config/logger.js';

// JWT payload structure
interface JwtPayload {
  userId: string;
  email: string;
  type: string;
}

// Socket user data structure
export interface SocketUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

// Socket data interface for type safety
export interface AuthenticatedSocketData {
  user?: SocketUser;
}

/**
 * Socket.io authentication middleware
 * Use with io.use(socketAuthMiddleware)
 */
export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
): Promise<void> => {
  const socketId = socket.id;

  try {
    // Extract token from handshake auth
    const token = socket.handshake.auth.token;

    if (!token) {
      socketLogger.warn({ socketId }, 'Socket connection rejected: No token provided');
      return next(new Error('Authentication error'));
    }

    if (typeof token !== 'string') {
      socketLogger.warn({ socketId }, 'Socket connection rejected: Invalid token format');
      return next(new Error('Authentication error'));
    }

    // Verify JWT token
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        socketLogger.warn({ socketId }, 'Socket connection rejected: Token expired');
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        socketLogger.warn({ socketId }, 'Socket connection rejected: Invalid token');
      } else {
        socketLogger.warn({ socketId, error: jwtError }, 'Socket connection rejected: Token verification failed');
      }
      return next(new Error('Authentication error'));
    }

    // Validate payload structure
    if (!payload.userId || !payload.email) {
      socketLogger.warn({ socketId }, 'Socket connection rejected: Invalid token payload');
      return next(new Error('Authentication error'));
    }

    // Look up user in database to get name and avatar
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      socketLogger.warn({ socketId, userId: payload.userId }, 'Socket connection rejected: User not found');
      return next(new Error('Authentication error'));
    }

    // Verify email matches (extra security check)
    if (user.email !== payload.email) {
      socketLogger.warn(
        { socketId, userId: payload.userId },
        'Socket connection rejected: Email mismatch'
      );
      return next(new Error('Authentication error'));
    }

    // Attach user to socket data
    socket.data.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };

    socketLogger.debug(
      { socketId, userId: user.id, userName: user.name },
      'Socket authenticated successfully'
    );

    next();
  } catch (error) {
    socketLogger.error(
      { socketId, error: error instanceof Error ? error.message : 'Unknown error' },
      'Socket authentication error'
    );
    next(new Error('Authentication error'));
  }
};

export default socketAuthMiddleware;
