/**
 * Centralized Environment Configuration with Zod Validation
 *
 * This module provides fail-fast startup validation for all environment variables.
 * If required variables are missing or invalid, the application will not start.
 */

import { z } from 'zod';

// Known placeholder values that should never be used in production
const PLACEHOLDER_SECRETS = [
  'your-secret-key',
  'your-super-secret-jwt-key-change-in-production',
  'changeme',
  'secret',
  'password',
  'jwt-secret',
];

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('Tasktrox'),
  PORT: z.coerce.number().default(4000),

  // URLs
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:4000'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Database (required)
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine((url) => url.startsWith('postgresql://') || url.startsWith('postgres://'), {
      message: 'DATABASE_URL must be a valid PostgreSQL connection string',
    }),

  // Redis (required)
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // JWT Authentication (required with security validation)
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .refine((val) => !PLACEHOLDER_SECRETS.includes(val.toLowerCase()), {
      message:
        'JWT_SECRET cannot use placeholder values. Generate a secure random secret: openssl rand -base64 48',
    }),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // OAuth - Google (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  // Note: In production, set this to the full URL (e.g., https://api.yourapp.com/api/v1/auth/google/callback)
  // The URL must match exactly what's registered in Google Cloud Console
  GOOGLE_CALLBACK_URL: z.string().optional(),

  // OAuth - Apple (optional)
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  APPLE_CALLBACK_URL: z.string().default('/api/v1/auth/apple/callback'),

  // File Storage - Cloudflare R2 (optional)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('tasktrox-files'),
  R2_PUBLIC_URL: z.string().optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@tasktrox.com'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

// Parse and validate environment variables
function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Environment validation failed:');
    console.error('');

    for (const error of result.error.errors) {
      const path = error.path.join('.');
      console.error(`  ${path}: ${error.message}`);
    }

    console.error('');
    console.error('Please check your .env file and ensure all required variables are set.');
    console.error('See .env.example for reference.');
    process.exit(1);
  }

  return result.data;
}

// Export validated environment
export const env = validateEnv();

// Type export for use in other modules
export type Env = z.infer<typeof envSchema>;
