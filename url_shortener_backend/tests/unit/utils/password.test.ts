import { hashPassword, comparePasswords } from '../../../src/utils/password';
import { describe, expect, it } from '@jest/globals';

describe('password utilities', () => {
  it('should hash a password', async () => {
    const password = 'password123';

    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
  });

  it('should generate different hashes for the same password', async () => {
    const password = 'password123';

    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });

  it('should return true when the password matches the hash', async () => {
    const password = 'password123';

    const hashedPassword = await hashPassword(password);

    const result = await comparePasswords(password, hashedPassword);

    expect(result).toBe(true);
  });

  it('should return false when the password does not match the hash', async () => {
    const password = 'password123';
    const wrongPassword = 'wrongPassword';

    const hashedPassword = await hashPassword(password);

    const result = await comparePasswords(wrongPassword, hashedPassword);

    expect(result).toBe(false);
  });
});
