import { getSorting } from '../../../src/utils/getSorting';
import { describe, expect, it } from '@jest/globals';

describe('getSorting', function () {
  const allowedFields = ['createdAt', 'updatedAt', 'shortCode'];
  // Valid sort field + ascending order
  it('should return the requested field with ascending direction', () => {
    expect(getSorting('updatedAt', 'asc', allowedFields)).toEqual({
      sortField: 'updatedAt',
      sortDirection: 1,
    });
  });

  it('should return the requested field with descending direction', () => {
    expect(getSorting('updatedAt', 'desc', allowedFields)).toEqual({
      sortField: 'updatedAt',
      sortDirection: -1,
    });
  });

  it('should fallback to createdAt when sort field is not allowed', () => {
    expect(getSorting('password', 'asc', allowedFields)).toEqual({
      sortField: 'createdAt',
      sortDirection: 1,
    });
  });

  it('should fallback to createdAt when sort field is empty', () => {
    expect(getSorting('', 'asc', allowedFields)).toEqual({
      sortField: 'createdAt',
      sortDirection: 1,
    });
  });

  it('should treat any sort order other than asc as descending', () => {
    expect(getSorting('createdAt', 'invalid', allowedFields)).toEqual({
      sortField: 'createdAt',
      sortDirection: -1,
    });
  });

  it('should handle an empty allowed fields array', () => {
    expect(getSorting('createdAt', 'asc', [])).toEqual({
      sortField: 'createdAt',
      sortDirection: 1,
    });
  });

  it('should correctly handle different allowed fields', () => {
    expect(getSorting('shortCode', 'desc', allowedFields)).toEqual({
      sortField: 'shortCode',
      sortDirection: -1,
    });
  });
});
