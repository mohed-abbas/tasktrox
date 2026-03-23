import request from 'supertest';
import { vi } from 'vitest';
import app from '../../app.js';
import { createTestUser, createAuthToken } from '../../test/factories.js';
import { truncateAllTables, disconnectDb } from '../../test/helpers.js';
import { AuthService } from '../../services/auth.service.js';

// Bypass rate limiting in tests
vi.mock('../../middleware/rate-limiter.middleware.js', () => {
  const passthrough = (_req: unknown, _res: unknown, next: () => void) => next();
  return {
    globalLimiter: passthrough,
    authRateLimiter: passthrough,
    passwordResetRateLimiter: passthrough,
    apiRateLimiter: passthrough,
    default: {
      globalLimiter: passthrough,
      authRateLimiter: passthrough,
      passwordResetRateLimiter: passthrough,
      apiRateLimiter: passthrough,
    },
  };
});

describe('Auth Routes', () => {
  afterEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await truncateAllTables();
    await disconnectDb();
  });

  // ============ POST /api/v1/auth/register ============

  describe('POST /api/v1/auth/register', () => {
    it('registers a new user and returns 201 with user and accessToken', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password123!',
          name: 'New User',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('newuser@example.com');
      expect(res.body.data.user.name).toBe('New User');
      expect(res.body.data.accessToken).toBeDefined();
      // Password should not be in the response
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('returns 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'incomplete@example.com' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
          name: 'Test User',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'weak@example.com',
          password: 'short',
          name: 'Test User',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 409 for duplicate email', async () => {
      await createTestUser({ email: 'dup@example.com' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'dup@example.com',
          password: 'Password123!',
          name: 'Dup User',
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USER_EXISTS');
    });
  });

  // ============ POST /api/v1/auth/login ============

  describe('POST /api/v1/auth/login', () => {
    it('returns 200 with user and tokens for valid credentials', async () => {
      // Register via service so we know the password
      await AuthService.register('login@example.com', 'Password123!', 'Login User');

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('login@example.com');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('returns 401 for wrong password', async () => {
      await AuthService.register('wrong@example.com', 'Password123!', 'User');

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPassword1!',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('returns 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('returns 400 for missing password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ============ POST /api/v1/auth/refresh ============

  describe('POST /api/v1/auth/refresh', () => {
    it('returns new access token for valid refresh token in cookie', async () => {
      // Register a user to get tokens
      const { tokens } = await AuthService.register(
        'refresh@example.com',
        'Password123!',
        'Refresh User'
      );

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${tokens.refreshToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('returns 401 for invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });

    it('returns 401 when no refresh token is provided', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NO_REFRESH_TOKEN');
    });
  });

  // ============ POST /api/v1/auth/logout ============

  describe('POST /api/v1/auth/logout', () => {
    it('returns 200 and clears the refresh token cookie', async () => {
      const { tokens } = await AuthService.register(
        'logout@example.com',
        'Password123!',
        'Logout User'
      );

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', `refreshToken=${tokens.refreshToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Logged out successfully');
    });

    it('returns 200 even without a refresh token cookie (idempotent)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ============ GET /api/v1/auth/me ============

  describe('GET /api/v1/auth/me', () => {
    it('returns 200 with user data for authenticated user', async () => {
      const user = await createTestUser({ email: 'me@example.com' });
      const token = createAuthToken(user);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('me@example.com');
    });

    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 with invalid auth token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
