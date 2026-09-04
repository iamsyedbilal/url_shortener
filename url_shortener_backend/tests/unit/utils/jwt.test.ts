import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../../src/utils/jwt';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('JWT utilities', () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken('user123', 'user');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken('user123', 'session123');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token and return its payload', () => {
      const token = generateAccessToken('user123', 'user');

      const payload = verifyAccessToken(token);

      expect(payload).toMatchObject({
        userId: 'user123',
        role: 'user',
      });
    });

    it('should throw an error for an invalid access token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token and return its payload', () => {
      const token = generateRefreshToken('user123', 'session123');

      const payload = verifyRefreshToken(token);

      expect(payload).toMatchObject({
        userId: 'user123',
        sessionId: 'session123',
      });
    });

    it('should throw an error for an invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });
});
