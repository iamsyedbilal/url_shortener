import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// --------------------------------------------------
// Mocks
// --------------------------------------------------

jest.unstable_mockModule('../../../src/models/url.model.js', () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

jest.unstable_mockModule('../../../src/utils/urlGenerator.js', () => ({
  generateShortCode: jest.fn(),
}));

// --------------------------------------------------
// Dynamic imports
// --------------------------------------------------

const { default: Url } = await import('../../../src/models/url.model.js');

const { generateShortCode } =
  await import('../../../src/utils/urlGenerator.js');

const { BaseURL } = await import('../../../src/utils/constant.js');

const {
  createUrl,
  getUrl,
  disableUserUrl,
  deleteUserUrl,
  redirectToOriginalUrl,
} = await import('../../../src/services/url.services.js');

// --------------------------------------------------
// Tests
// --------------------------------------------------

describe('URL Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================================================
  // createUrl
  // ==================================================

  describe('createUrl', () => {
    test('should create a new URL successfully', async () => {
      (Url.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve(null)
      );

      (generateShortCode as jest.Mock).mockReturnValue('abc123');

      const createdUrl = {
        _id: 'url-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        userId: 'user-id',
      };

      (Url.create as jest.Mock).mockImplementation(() =>
        Promise.resolve(createdUrl)
      );

      const result = await createUrl('https://example.com', 'user-id');

      expect(Url.findOne).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        userId: 'user-id',
      });

      expect(generateShortCode).toHaveBeenCalledWith(6);

      expect(Url.create).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        userId: 'user-id',
      });

      expect(result).toEqual({
        id: 'url-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: `${BaseURL}/abc123`,
      });
    });

    test('should return existing URL if the same URL already exists for the user', async () => {
      const existingUrl = {
        _id: 'existing-url-id',
        originalUrl: 'https://example.com',
        shortCode: 'existing123',
        userId: 'user-id',
      };

      (Url.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve(existingUrl)
      );

      const result = await createUrl('https://example.com', 'user-id');

      expect(Url.findOne).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        userId: 'user-id',
      });

      expect(generateShortCode).not.toHaveBeenCalled();
      expect(Url.create).not.toHaveBeenCalled();

      expect(result).toEqual({
        id: 'existing-url-id',
        originalUrl: 'https://example.com',
        shortCode: 'existing123',
        shortUrl: `${BaseURL}/existing123`,
      });
    });

    test('should generate another short code if the first code already exists', async () => {
      (generateShortCode as jest.Mock)
        .mockReturnValueOnce('abc123')
        .mockReturnValueOnce('xyz789');

      (Url.findOne as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve(null))
        .mockImplementationOnce(() =>
          Promise.resolve({
            _id: 'existing-url-id',
            shortCode: 'abc123',
          })
        )
        .mockImplementationOnce(() => Promise.resolve(null));

      const createdUrl = {
        _id: 'new-url-id',
        originalUrl: 'https://example.com',
        shortCode: 'xyz789',
        userId: 'user-id',
      };

      (Url.create as jest.Mock).mockImplementation(() =>
        Promise.resolve(createdUrl)
      );

      const result = await createUrl('https://example.com', 'user-id');

      expect(generateShortCode).toHaveBeenCalledTimes(2);

      expect(Url.create).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        shortCode: 'xyz789',
        userId: 'user-id',
      });

      expect(result).toEqual({
        id: 'new-url-id',
        originalUrl: 'https://example.com',
        shortCode: 'xyz789',
        shortUrl: `${BaseURL}/xyz789`,
      });
    });
  });

  // ==================================================
  // getUrl
  // ==================================================

  describe('getUrl', () => {
    test('should return user URLs sorted by newest first', async () => {
      const urls = [
        {
          originalUrl: 'https://example.com/two',
          shortCode: 'two222',
          createdAt: new Date('2026-01-02'),
        },
        {
          originalUrl: 'https://example.com/one',
          shortCode: 'one111',
          createdAt: new Date('2026-01-01'),
        },
      ];

      const sort = jest.fn().mockImplementation(() => Promise.resolve(urls));

      (Url.find as jest.Mock).mockReturnValue({
        sort,
      });

      const result = await getUrl('user-id');

      expect(Url.find).toHaveBeenCalledWith({
        userId: 'user-id',
      });

      expect(sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(result).toEqual([
        {
          originalUrl: 'https://example.com/two',
          shortCode: 'two222',
          shortUrl: `${BaseURL}/two222`,
        },
        {
          originalUrl: 'https://example.com/one',
          shortCode: 'one111',
          shortUrl: `${BaseURL}/one111`,
        },
      ]);
    });

    test('should return empty array when user has no URLs', async () => {
      const sort = jest.fn().mockImplementation(() => Promise.resolve([]));

      (Url.find as jest.Mock).mockReturnValue({
        sort,
      });

      const result = await getUrl('user-id');

      expect(Url.find).toHaveBeenCalledWith({
        userId: 'user-id',
      });

      expect(sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(result).toEqual([]);
    });
  });

  // ==================================================
  // disableUserUrl
  // ==================================================

  describe('disableUserUrl', () => {
    test('should disable an active URL successfully', async () => {
      const url = {
        _id: 'url-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        userId: 'user-id',
        isActive: true,
        save: jest.fn().mockImplementation(() => Promise.resolve(undefined)),
      };

      (Url.findOne as jest.Mock).mockImplementation(() => Promise.resolve(url));

      const result = await disableUserUrl('url-id', 'user-id');

      expect(Url.findOne).toHaveBeenCalledWith({
        _id: 'url-id',
        userId: 'user-id',
      });

      expect(url.isActive).toBe(false);

      expect(url.save).toHaveBeenCalled();

      expect(result).toBe(url);
    });

    test('should throw 404 if URL does not exist', async () => {
      (Url.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve(null)
      );

      await expect(disableUserUrl('url-id', 'user-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'URL not found',
      });

      expect(Url.findOne).toHaveBeenCalledWith({
        _id: 'url-id',
        userId: 'user-id',
      });
    });

    test('should throw 400 if URL is already disabled', async () => {
      const url = {
        _id: 'url-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        userId: 'user-id',
        isActive: false,
        save: jest.fn(),
      };

      (Url.findOne as jest.Mock).mockImplementation(() => Promise.resolve(url));

      await expect(disableUserUrl('url-id', 'user-id')).rejects.toMatchObject({
        statusCode: 400,
        message: 'URL is already disabled',
      });

      expect(url.save).not.toHaveBeenCalled();
    });
  });

  // ==================================================
  // deleteUserUrl
  // ==================================================

  describe('deleteUserUrl', () => {
    test('should delete a user URL successfully', async () => {
      const url = {
        _id: 'url-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        userId: 'user-id',
      };

      (Url.findOne as jest.Mock).mockImplementation(() => Promise.resolve(url));

      (Url.deleteOne as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          acknowledged: true,
          deletedCount: 1,
        })
      );

      await deleteUserUrl('url-id', 'user-id');

      expect(Url.findOne).toHaveBeenCalledWith({
        _id: 'url-id',
        userId: 'user-id',
      });

      expect(Url.deleteOne).toHaveBeenCalledWith(url);
    });

    test('should throw 404 if URL does not exist', async () => {
      (Url.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve(null)
      );

      await expect(deleteUserUrl('url-id', 'user-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'URL not found',
      });

      expect(Url.deleteOne).not.toHaveBeenCalled();
    });
  });

  // ==================================================
  // redirectToOriginalUrl
  // ==================================================

  describe('redirectToOriginalUrl', () => {
    test('should return original URL and increment click count', async () => {
      const url = {
        _id: 'url-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        isActive: true,
        clickCount: 5,
        save: jest.fn().mockImplementation(() => Promise.resolve(undefined)),
      };

      (Url.findOne as jest.Mock).mockImplementation(() => Promise.resolve(url));

      const result = await redirectToOriginalUrl('abc123');

      expect(Url.findOne).toHaveBeenCalledWith({
        shortCode: 'abc123',
      });

      expect(url.clickCount).toBe(6);

      expect(url.save).toHaveBeenCalled();

      expect(result).toBe('https://example.com');
    });

    test('should throw 404 if short code does not exist', async () => {
      (Url.findOne as jest.Mock).mockImplementation(() =>
        Promise.resolve(null)
      );

      await expect(redirectToOriginalUrl('notfound')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Short URL not found',
      });
    });

    test('should throw 410 if short URL is disabled', async () => {
      const url = {
        _id: 'url-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        isActive: false,
        clickCount: 5,
        save: jest.fn(),
      };

      (Url.findOne as jest.Mock).mockImplementation(() => Promise.resolve(url));

      await expect(redirectToOriginalUrl('abc123')).rejects.toMatchObject({
        statusCode: 410,
        message: 'Short URL is disabled',
      });

      expect(url.clickCount).toBe(5);
      expect(url.save).not.toHaveBeenCalled();
    });
  });
});
