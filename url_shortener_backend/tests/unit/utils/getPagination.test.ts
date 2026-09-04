import { getPagination } from '../../../src/utils/getPagination';
import { describe, expect, it } from '@jest/globals';

describe('getPagination', function () {
  // Check for default pagination
  it('should return default pagination values', function () {
    expect(getPagination()).toEqual({
      pageNumber: 1,
      limitNumber: 10,
      skip: 0,
    });
  });

  //Check for pagination calculation
  it('should calculate the pagination correctly', function () {
    expect(getPagination('2', '10')).toEqual({
      pageNumber: 2,
      limitNumber: 10,
      skip: 10,
    });
  });

  //Check for page less then boundary
  it('should set page to 1 when page is less then 1', function () {
    expect(getPagination('0', '10')).toEqual({
      pageNumber: 1,
      limitNumber: 10,
      skip: 0,
    });
  });

  //   Check for limit to 1 when limit is less then 1
  it('should set limit to 1 when the limit is less than 1', function () {
    expect(getPagination('1', '0')).toEqual({
      pageNumber: 1,
      limitNumber: 1,
      skip: 0,
    });
  });

  //   Should cap the limit
  it('should cap limit at 100', () => {
    expect(getPagination('1', '500')).toEqual({
      pageNumber: 1,
      limitNumber: 100,
      skip: 0,
    });
  });

  it('should calculate skip correctly for different pages', () => {
    expect(getPagination('5', '10')).toEqual({
      pageNumber: 5,
      limitNumber: 10,
      skip: 40,
    });
  });
});
