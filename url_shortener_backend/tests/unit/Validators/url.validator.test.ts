import { createUrlSchema } from '../../../src/validators/url.validator';
import { describe, expect, it } from '@jest/globals';

describe('createUrlSchema', () => {
  it('should accept a valid URL', () => {
    const result = createUrlSchema.safeParse({
      originalUrl: 'https://example.com',
    });

    expect(result.success).toBe(true);
  });

  it('should reject an invalid URL', () => {
    const result = createUrlSchema.safeParse({
      originalUrl: 'not-a-url',
    });

    expect(result.success).toBe(false);
  });

  it('should reject when originalUrl is missing', () => {
    const result = createUrlSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
