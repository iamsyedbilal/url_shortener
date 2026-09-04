import { describe, expect, it } from '@jest/globals';
import { generateShortCode } from '../../../src/utils/urlGenerator';

describe('generateShortCode', function () {
  it('should generate a short code with default length of 6', () => {
    const code = generateShortCode();
    expect(code).toHaveLength(6);
  });

  it('should generate a short code with the specified length', () => {
    const code = generateShortCode(10);
    expect(code).toHaveLength(10);
  });

  it('should generate a short code containing only allowed characters', () => {
    const code = generateShortCode(20);
    expect(code).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('should generate different short codes on multiple calls', () => {
    const code1 = generateShortCode();
    const code2 = generateShortCode();
    expect(code1).not.toBe(code2);
  });
});
