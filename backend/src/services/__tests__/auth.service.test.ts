import { AuthService } from '../auth.service.js';
import { createTestUser } from '../../test/factories.js';
import { truncateAllTables, disconnectDb } from '../../test/helpers.js';
import { prisma } from '../../config/database.js';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  afterEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await truncateAllTables();
    await disconnectDb();
  });

  // ============ hashPassword / verifyPassword ============

  describe('hashPassword / verifyPassword', () => {
    it('hashes a password and verifies it correctly', async () => {
      const password = 'MyPassword123!';
      const hash = await AuthService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);

      const result = await AuthService.verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('returns false for a wrong password', async () => {
      const hash = await AuthService.hashPassword('CorrectPassword1');
      const result = await AuthService.verifyPassword('WrongPassword1', hash);
      expect(result).toBe(false);
    });

    it('produces different hashes for the same password (salted)', async () => {
      const password = 'SamePassword1';
      const hash1 = await AuthService.hashPassword(password);
      const hash2 = await AuthService.hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  // ============ generateAccessToken ============

  describe('generateAccessToken', () => {
    it('returns a JWT string containing userId and email', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const token = AuthService.generateAccessToken(payload);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };
      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
    });
  });

  // ============ generateRefreshToken ============

  describe('generateRefreshToken', () => {
    it('returns a random hex string', () => {
      const token = AuthService.generateRefreshToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('returns unique tokens on each call', () => {
      const token1 = AuthService.generateRefreshToken();
      const token2 = AuthService.generateRefreshToken();
      expect(token1).not.toBe(token2);
    });
  });

  // ============ generateTokens ============

  describe('generateTokens', () => {
    it('returns accessToken and refreshToken, and stores refreshToken in DB', async () => {
      const user = await createTestUser();
      const tokens = await AuthService.generateTokens(user);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');

      // Verify refresh token is stored in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: tokens.refreshToken },
      });
      expect(storedToken).not.toBeNull();
      expect(storedToken!.userId).toBe(user.id);
    });
  });

  // ============ register ============

  describe('register', () => {
    it('creates a new user and returns user with tokens', async () => {
      const result = await AuthService.register(
        'newuser@example.com',
        'Password123!',
        'New User'
      );

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.name).toBe('New User');
      expect(result.user.provider).toBe('local');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();

      // Verify user exists in DB
      const dbUser = await prisma.user.findUnique({
        where: { email: 'newuser@example.com' },
      });
      expect(dbUser).not.toBeNull();
    });

    it('throws an error for duplicate email', async () => {
      await createTestUser({ email: 'duplicate@example.com' });

      await expect(
        AuthService.register('duplicate@example.com', 'Password123!', 'Dup User')
      ).rejects.toThrow('User with this email already exists');
    });
  });

  // ============ login ============

  describe('login', () => {
    it('returns user and tokens for valid credentials', async () => {
      // Register a user first (with known password)
      await AuthService.register('login@example.com', 'Password123!', 'Login User');

      const result = await AuthService.login('login@example.com', 'Password123!');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('login@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('throws an error for wrong password', async () => {
      await AuthService.register('wrongpw@example.com', 'Password123!', 'User');

      await expect(
        AuthService.login('wrongpw@example.com', 'WrongPassword1!')
      ).rejects.toThrow('Invalid email or password');
    });

    it('throws an error for non-existent email', async () => {
      await expect(
        AuthService.login('nobody@example.com', 'Password123!')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  // ============ verifyAccessToken ============

  describe('verifyAccessToken', () => {
    it('returns payload for a valid token', () => {
      const token = AuthService.generateAccessToken({
        userId: 'abc',
        email: 'abc@test.com',
      });
      const result = AuthService.verifyAccessToken(token);
      expect(result).not.toBeNull();
      expect(result!.userId).toBe('abc');
      expect(result!.email).toBe('abc@test.com');
    });

    it('returns null for an invalid token', () => {
      const result = AuthService.verifyAccessToken('not-a-valid-token');
      expect(result).toBeNull();
    });
  });

  // ============ refreshTokens ============

  describe('refreshTokens', () => {
    it('returns new tokens for a valid refresh token', async () => {
      const user = await createTestUser();
      const originalTokens = await AuthService.generateTokens(user);

      const newTokens = await AuthService.refreshTokens(originalTokens.refreshToken);

      expect(newTokens).not.toBeNull();
      expect(newTokens!.accessToken).toBeDefined();
      expect(newTokens!.refreshToken).toBeDefined();
      // Old refresh token should be deleted (rotation)
      expect(newTokens!.refreshToken).not.toBe(originalTokens.refreshToken);
    });

    it('returns null for an invalid refresh token', async () => {
      const result = await AuthService.refreshTokens('invalid-token');
      expect(result).toBeNull();
    });

    it('returns null for an expired refresh token', async () => {
      const user = await createTestUser();

      // Create a token that is already expired
      const expiredToken = AuthService.generateRefreshToken();
      await prisma.refreshToken.create({
        data: {
          token: expiredToken,
          userId: user.id,
          expiresAt: new Date(Date.now() - 1000), // 1 second in the past
        },
      });

      const result = await AuthService.refreshTokens(expiredToken);
      expect(result).toBeNull();
    });
  });

  // ============ revokeRefreshToken ============

  describe('revokeRefreshToken', () => {
    it('removes the refresh token from the database', async () => {
      const user = await createTestUser();
      const tokens = await AuthService.generateTokens(user);

      // Verify token exists
      const before = await prisma.refreshToken.findUnique({
        where: { token: tokens.refreshToken },
      });
      expect(before).not.toBeNull();

      await AuthService.revokeRefreshToken(tokens.refreshToken);

      // Verify token is gone
      const after = await prisma.refreshToken.findUnique({
        where: { token: tokens.refreshToken },
      });
      expect(after).toBeNull();
    });
  });

  // ============ revokeAllUserTokens ============

  describe('revokeAllUserTokens', () => {
    it('removes all refresh tokens for a user', async () => {
      const user = await createTestUser();
      await AuthService.generateTokens(user);
      await AuthService.generateTokens(user);

      const countBefore = await prisma.refreshToken.count({
        where: { userId: user.id },
      });
      expect(countBefore).toBeGreaterThanOrEqual(2);

      await AuthService.revokeAllUserTokens(user.id);

      const countAfter = await prisma.refreshToken.count({
        where: { userId: user.id },
      });
      expect(countAfter).toBe(0);
    });
  });
});
