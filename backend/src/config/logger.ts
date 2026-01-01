/**
 * Structured Logging with Pino
 *
 * Provides centralized logging configuration with:
 * - Environment-specific formatting (pretty in dev, JSON in prod)
 * - Automatic redaction of sensitive fields
 * - Child loggers for different modules
 * - Consistent log levels across the application
 */

import pino from 'pino';
import { env } from './env.js';

// Configure transport for development (pretty printing)
const developmentTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
};

// Create the base logger
export const logger = pino({
  level: env.LOG_LEVEL,

  // Redact sensitive information from logs
  redact: {
    paths: [
      'password',
      'refreshToken',
      'accessToken',
      'token',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },

  // Use pretty transport in development
  ...(env.NODE_ENV === 'development' && { transport: developmentTransport }),

  // Base context for all logs
  base: {
    env: env.NODE_ENV,
  },
});

// Child loggers for different modules
export const httpLogger = logger.child({ module: 'http' });
export const dbLogger = logger.child({ module: 'database' });
export const redisLogger = logger.child({ module: 'redis' });
export const socketLogger = logger.child({ module: 'socket' });
export const authLogger = logger.child({ module: 'auth' });
export const searchLogger = logger.child({ module: 'search' });

// Type for log context
export type LogContext = Record<string, unknown>;

/**
 * Log helper for request context
 */
export function logRequest(
  req: { method: string; url: string; ip?: string },
  message: string,
  context?: LogContext
) {
  httpLogger.info(
    {
      method: req.method,
      url: req.url,
      ip: req.ip,
      ...context,
    },
    message
  );
}

/**
 * Log helper for errors with stack traces
 */
export function logError(error: Error, context?: LogContext) {
  logger.error(
    {
      err: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
      ...context,
    },
    error.message
  );
}

export default logger;
