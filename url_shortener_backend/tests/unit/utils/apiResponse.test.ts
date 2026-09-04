import { describe, expect, it } from '@jest/globals';
import ApiResponse from '../../../src/utils/apiResponse';

describe('ApiResponse', () => {
  it('should create a successful response for 2xx status codes', () => {
    const response = new ApiResponse(200, 'Success', { id: '123' });

    expect(response.statusCode).toBe(200);
    expect(response.message).toBe('Success');
    expect(response.data).toEqual({ id: '123' });
    expect(response.success).toBe(true);
  });

  it('should set success to false for non-2xx status codes', () => {
    const response = new ApiResponse(400, 'Bad Request', null);

    expect(response.statusCode).toBe(400);
    expect(response.message).toBe('Bad Request');
    expect(response.success).toBe(false);
  });

  it('should use the default message when no message is provided', () => {
    const response = new ApiResponse(200, undefined, { id: '123' });

    expect(response.message).toBe('Success');
  });

  it('should correctly store the provided data', () => {
    const data = {
      id: '123',
      shortCode: 'abc123',
    };

    const response = new ApiResponse(201, 'URL created', data);

    expect(response.data).toEqual(data);
  });
});
