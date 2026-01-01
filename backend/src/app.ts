import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rate-limiter.middleware.js';
import { initializePassport } from './config/passport.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { setCsrfCookie } from './middleware/csrf.middleware.js';
import routes from './routes/index.js';
import healthRoutes from './routes/health.routes.js';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Global rate limiting
app.use('/api', globalLimiter);

// Initialize Passport
app.use(initializePassport());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF protection - set token cookie on all responses
app.use(setCsrfCookie);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check routes
app.use('/health', healthRoutes);

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
