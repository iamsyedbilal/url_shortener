import ApiError from '../../../src/utils/apiError';
import { describe, expect, it } from '@jest/globals';

describe('ApiError', () => {
  it('should create an error with the given status code and message', () => {
    const error = new ApiError(400, 'Bad Request');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad Request');
  });

  it('should set data to null and success to false', () => {
    const error = new ApiError(400, 'Bad Request');

    expect(error.data).toBeNull();
    expect(error.success).toBe(false);
  });

  it('should use the default message when no message is provided', () => {
    const error = new ApiError(500);

    expect(error.message).toBe('Something went wrong');
  });

  it('should store errors when provided', () => {
    const errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Password is required' },
    ];

    const error = new ApiError(400, 'Validation failed', errors);

    expect(error.errors).toEqual(errors);
  });

  it('should extend the Error class', () => {
    const error = new ApiError(404, 'Not Found');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });
});
