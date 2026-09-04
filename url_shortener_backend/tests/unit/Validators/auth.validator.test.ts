import {
  registerSchema,
  loginSchema,
} from '../../../src/validators/auth.validator';
import { describe, expect, it } from '@jest/globals';

describe('registerSchema', () => {
  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse({
      username: 'john123',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('should reject username shorter than 3 characters', () => {
    const result = registerSchema.safeParse({
      username: 'jo',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(false);
  });

  it('should reject username longer than 30 characters', () => {
    const result = registerSchema.safeParse({
      username: 'a'.repeat(31),
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(false);
  });

  it('should reject an invalid email', () => {
    const result = registerSchema.safeParse({
      username: 'john123',
      email: 'invalid-email',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(false);
  });

  it('should reject a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      username: 'john123',
      email: 'john@example.com',
      password: '1234567',
      confirmPassword: '1234567',
    });

    expect(result.success).toBe(false);
  });

  it('should reject when passwords do not match', () => {
    const result = registerSchema.safeParse({
      username: 'john123',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'different123',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['confirmPassword'],
            message: 'Passwords do not match',
          }),
        ])
      );
    }
  });

  it('should trim the username and email', () => {
    const result = registerSchema.safeParse({
      username: '  john123  ',
      email: '  john@example.com  ',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.username).toBe('john123');
      expect(result.data.email).toBe('john@example.com');
    }
  });

  it('should reject missing required fields', () => {
    const result = registerSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('should accept valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('should reject an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    });

    expect(result.success).toBe(false);
  });

  it('should reject a password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({
      email: 'john@example.com',
      password: '1234567',
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const result = loginSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
