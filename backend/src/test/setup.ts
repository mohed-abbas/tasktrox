// Set env vars BEFORE any app module imports.
// env.ts validates at import time and calls process.exit(1) on failure.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  'postgresql://tasktrox:tasktrox_secret@localhost:5432/tasktrox_test?schema=public';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.APP_URL = 'http://localhost:3000';
process.env.API_URL = 'http://localhost:4000';
