import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../auth.validator.js';

// ============ REGISTER ============

describe('registerSchema', () => {
  const validBody = {
    email: 'user@example.com',
    password: 'MyPassword1',
    name: 'John Doe',
  };

  it('accepts valid registration input', () => {
    const result = registerSchema.safeParse({ body: validBody });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = registerSchema.safeParse({
      body: { ...validBody, email: undefined },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = registerSchema.safeParse({
      body: { ...validBody, email: 'not-an-email' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      body: { ...validBody, password: 'Short1' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase letter', () => {
    const result = registerSchema.safeParse({
      body: { ...validBody, password: 'nouppercase1' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without lowercase letter', () => {
    const result = registerSchema.safeParse({
      body: { ...validBody, password: 'NOLOWERCASE1' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without digit', () => {
    const result = registerSchema.safeParse({
      body: { ...validBody, password: 'NoDigitHere' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({
      body: { ...validBody, name: 'A' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 100 characters', () => {
    const result = registerSchema.safeParse({
      body: { ...validBody, name: 'a'.repeat(101) },
    });
    expect(result.success).toBe(false);
  });

  it('accepts name at exactly 2 characters', () => {
    const result = registerSchema.safeParse({
      body: { ...validBody, name: 'AB' },
    });
    expect(result.success).toBe(true);
  });
});

// ============ LOGIN ============

describe('loginSchema', () => {
  it('accepts valid login input', () => {
    const result = loginSchema.safeParse({
      body: { email: 'user@example.com', password: 'somepassword' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({
      body: { password: 'somepassword' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({
      body: { email: 'user@example.com' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      body: { email: 'bad-email', password: 'pass' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      body: { email: 'user@example.com', password: '' },
    });
    expect(result.success).toBe(false);
  });
});

// ============ FORGOT PASSWORD ============

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    const result = forgotPasswordSchema.safeParse({
      body: { email: 'user@example.com' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = forgotPasswordSchema.safeParse({
      body: { email: 'not-an-email' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = forgotPasswordSchema.safeParse({ body: {} });
    expect(result.success).toBe(false);
  });
});

// ============ RESET PASSWORD ============

describe('resetPasswordSchema', () => {
  it('accepts valid reset input', () => {
    const result = resetPasswordSchema.safeParse({
      body: {
        token: 'some-reset-token-abc123',
        password: 'NewPassword1',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing token', () => {
    const result = resetPasswordSchema.safeParse({
      body: { password: 'NewPassword1' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty token', () => {
    const result = resetPasswordSchema.safeParse({
      body: { token: '', password: 'NewPassword1' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects weak password', () => {
    const result = resetPasswordSchema.safeParse({
      body: { token: 'token', password: 'weak' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without required character types', () => {
    const result = resetPasswordSchema.safeParse({
      body: { token: 'token', password: 'nouppercase1' },
    });
    expect(result.success).toBe(false);
  });
});

// ============ REFRESH TOKEN ============

describe('refreshTokenSchema', () => {
  it('accepts body with refresh token', () => {
    const result = refreshTokenSchema.safeParse({
      body: { refreshToken: 'some-token' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts body without refresh token (optional)', () => {
    const result = refreshTokenSchema.safeParse({ body: {} });
    expect(result.success).toBe(true);
  });

  it('accepts empty body', () => {
    const result = refreshTokenSchema.safeParse({ body: {} });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.refreshToken).toBeUndefined();
    }
  });
});
