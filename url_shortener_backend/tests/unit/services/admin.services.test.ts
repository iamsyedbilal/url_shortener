import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// --------------------------------------------------
// Mocks
// --------------------------------------------------

jest.unstable_mockModule('../../../src/models/url.model.js', () => ({
  default: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

jest.unstable_mockModule('../../../src/models/user.model.js', () => ({
  default: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule('../../../src/utils/getPagination.js', () => ({
  getPagination: jest.fn(),
}));

jest.unstable_mockModule('../../../src/utils/getSorting.js', () => ({
  getSorting: jest.fn(),
}));

// --------------------------------------------------
// Dynamic imports
// --------------------------------------------------

const { default: Url } = await import('../../../src/models/url.model.js');

const { default: User } = await import('../../../src/models/user.model.js');

const { getPagination } = await import('../../../src/utils/getPagination.js');

const { getSorting } = await import('../../../src/utils/getSorting.js');

const {
  getAllUsersService,
  getAllUrlsService,
  disableUrlByAdmin,
  deleteUrlByAdmin,
} = await import('../../../src/services/admin.services.js');

// --------------------------------------------------
// Tests
// --------------------------------------------------

describe('Admin Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================================================
  // getAllUsersService
  // ==================================================

  describe('getAllUsersService', () => {
    test('should return all users successfully', async () => {
      const users = [
        {
          _id: 'user-1',
          username: 'bilal',
          email: 'bilal@example.com',
          role: 'user',
        },
        {
          _id: 'user-2',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(users);

      (User.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (User.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await getAllUsersService({});

      expect(getPagination).toHaveBeenCalledWith('1', '10');

      expect(getSorting).toHaveBeenCalledWith('createdAt', 'desc', [
        'createdAt',
        'updatedAt',
        'username',
        'email',
      ]);

      expect(User.find).toHaveBeenCalledWith({});

      expect(sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(skip).toHaveBeenCalledWith(0);
      expect(limit).toHaveBeenCalledWith(10);

      expect(User.countDocuments).toHaveBeenCalledWith({});

      expect(result).toEqual({
        users,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    test('should filter users by role', async () => {
      const users = [
        {
          _id: 'user-1',
          username: 'bilal',
          email: 'bilal@example.com',
          role: 'user',
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(users);

      (User.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (User.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await getAllUsersService({
        role: 'user',
      });

      expect(User.find).toHaveBeenCalledWith({
        role: 'user',
      });

      expect(User.countDocuments).toHaveBeenCalledWith({
        role: 'user',
      });

      expect(result.pagination.total).toBe(1);
      expect(result.users).toEqual(users);
    });

    test('should filter users by admin role', async () => {
      const users = [
        {
          _id: 'admin-1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(users);

      (User.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (User.countDocuments as jest.Mock).mockResolvedValue(1);

      await getAllUsersService({
        role: 'admin',
      });

      expect(User.find).toHaveBeenCalledWith({
        role: 'admin',
      });
    });

    test('should ignore invalid role filter', async () => {
      const users = [
        {
          _id: 'user-1',
          username: 'bilal',
          email: 'bilal@example.com',
          role: 'user',
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(users);

      (User.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (User.countDocuments as jest.Mock).mockResolvedValue(1);

      await getAllUsersService({
        role: 'something-invalid',
      });

      expect(User.find).toHaveBeenCalledWith({});
    });

    test('should search users by username and email', async () => {
      const users = [
        {
          _id: 'user-1',
          username: 'bilal',
          email: 'bilal@example.com',
          role: 'user',
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'username',
        sortDirection: 1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(users);

      (User.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (User.countDocuments as jest.Mock).mockResolvedValue(1);

      await getAllUsersService({
        search: '  bilal  ',
        sortBy: 'username',
        sortOrder: 'asc',
      });

      expect(User.find).toHaveBeenCalledWith({
        $or: [
          {
            username: {
              $regex: 'bilal',
              $options: 'i',
            },
          },
          {
            email: {
              $regex: 'bilal',
              $options: 'i',
            },
          },
        ],
      });

      expect(User.countDocuments).toHaveBeenCalledWith({
        $or: [
          {
            username: {
              $regex: 'bilal',
              $options: 'i',
            },
          },
          {
            email: {
              $regex: 'bilal',
              $options: 'i',
            },
          },
        ],
      });
    });

    test('should combine role and search filters', async () => {
      const users = [
        {
          _id: 'admin-1',
          username: 'bilal-admin',
          email: 'admin@example.com',
          role: 'admin',
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(users);

      (User.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (User.countDocuments as jest.Mock).mockResolvedValue(1);

      await getAllUsersService({
        role: 'admin',
        search: 'bilal',
      });

      expect(User.find).toHaveBeenCalledWith({
        role: 'admin',
        $or: [
          {
            username: {
              $regex: 'bilal',
              $options: 'i',
            },
          },
          {
            email: {
              $regex: 'bilal',
              $options: 'i',
            },
          },
        ],
      });
    });

    test('should throw 400 if user search query is too long', async () => {
      const longSearch = 'a'.repeat(101);

      await expect(
        getAllUsersService({
          search: longSearch,
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Search query is too long',
      });

      expect(User.find).not.toHaveBeenCalled();
      expect(User.countDocuments).not.toHaveBeenCalled();
    });

    test('should throw 404 if no users are found', async () => {
      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue([]);

      (User.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (User.countDocuments as jest.Mock).mockResolvedValue(0);

      await expect(getAllUsersService({})).rejects.toMatchObject({
        statusCode: 404,
        message: 'No user found',
      });
    });

    test('should calculate pagination correctly', async () => {
      const users = [{ _id: 'user-21' }];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 3,
        limitNumber: 10,
        skip: 20,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'email',
        sortDirection: 1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(users);

      (User.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (User.countDocuments as jest.Mock).mockResolvedValue(25);

      const result = await getAllUsersService({
        page: '3',
        limit: '10',
        sortBy: 'email',
        sortOrder: 'asc',
      });

      expect(getPagination).toHaveBeenCalledWith('3', '10');

      expect(skip).toHaveBeenCalledWith(20);
      expect(limit).toHaveBeenCalledWith(10);

      expect(sort).toHaveBeenCalledWith({
        email: 1,
      });

      expect(result.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });
  });

  // ==================================================
  // getAllUrlsService
  // ==================================================

  describe('getAllUrlsService', () => {
    test('should return all URLs successfully', async () => {
      const urls = [
        {
          _id: 'url-1',
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          isActive: true,
        },
        {
          _id: 'url-2',
          shortCode: 'xyz789',
          originalUrl: 'https://google.com',
          isActive: false,
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(urls);

      (Url.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (Url.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await getAllUrlsService({});

      expect(Url.find).toHaveBeenCalledWith({});

      expect(sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(skip).toHaveBeenCalledWith(0);
      expect(limit).toHaveBeenCalledWith(10);

      expect(Url.countDocuments).toHaveBeenCalledWith({});

      expect(result).toEqual({
        urls,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    test('should filter active URLs when isActive is true', async () => {
      const urls = [
        {
          _id: 'url-1',
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          isActive: true,
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(urls);

      (Url.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (Url.countDocuments as jest.Mock).mockResolvedValue(1);

      await getAllUrlsService({
        isActive: 'true',
      });

      expect(Url.find).toHaveBeenCalledWith({
        isActive: true,
      });

      expect(Url.countDocuments).toHaveBeenCalledWith({
        isActive: true,
      });
    });

    test('should filter inactive URLs when isActive is false', async () => {
      const urls = [
        {
          _id: 'url-1',
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          isActive: false,
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(urls);

      (Url.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (Url.countDocuments as jest.Mock).mockResolvedValue(1);

      await getAllUrlsService({
        isActive: 'false',
      });

      expect(Url.find).toHaveBeenCalledWith({
        isActive: false,
      });

      expect(Url.countDocuments).toHaveBeenCalledWith({
        isActive: false,
      });
    });

    test('should ignore invalid isActive value', async () => {
      const urls = [
        {
          _id: 'url-1',
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          isActive: true,
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(urls);

      (Url.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (Url.countDocuments as jest.Mock).mockResolvedValue(1);

      await getAllUrlsService({
        isActive: 'invalid',
      });

      expect(Url.find).toHaveBeenCalledWith({});
    });

    test('should search URLs by shortCode and originalUrl', async () => {
      const urls = [
        {
          _id: 'url-1',
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          isActive: true,
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'shortCode',
        sortDirection: 1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(urls);

      (Url.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (Url.countDocuments as jest.Mock).mockResolvedValue(1);

      await getAllUrlsService({
        search: '  abc  ',
        sortBy: 'shortCode',
        sortOrder: 'asc',
      });

      expect(Url.find).toHaveBeenCalledWith({
        $or: [
          {
            shortCode: {
              $regex: 'abc',
              $options: 'i',
            },
          },
          {
            originalUrl: {
              $regex: 'abc',
              $options: 'i',
            },
          },
        ],
      });
    });

    test('should combine isActive and search filters', async () => {
      const urls = [
        {
          _id: 'url-1',
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          isActive: true,
        },
      ];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(urls);

      (Url.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (Url.countDocuments as jest.Mock).mockResolvedValue(1);

      await getAllUrlsService({
        isActive: 'true',
        search: 'example',
      });

      expect(Url.find).toHaveBeenCalledWith({
        isActive: true,
        $or: [
          {
            shortCode: {
              $regex: 'example',
              $options: 'i',
            },
          },
          {
            originalUrl: {
              $regex: 'example',
              $options: 'i',
            },
          },
        ],
      });
    });

    test('should throw 400 if URL search query is too long', async () => {
      const longSearch = 'a'.repeat(101);

      await expect(
        getAllUrlsService({
          search: longSearch,
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Search query is too long',
      });

      expect(Url.find).not.toHaveBeenCalled();
      expect(Url.countDocuments).not.toHaveBeenCalled();
    });

    test('should return empty array when no URLs are found', async () => {
      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 1,
        limitNumber: 10,
        skip: 0,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'createdAt',
        sortDirection: -1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue([]);

      (Url.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (Url.countDocuments as jest.Mock).mockResolvedValue(0);

      const result = await getAllUrlsService({});

      expect(result).toEqual({
        urls: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });

    test('should calculate URL pagination correctly', async () => {
      const urls = [{ _id: 'url-21' }];

      (getPagination as jest.Mock).mockReturnValue({
        pageNumber: 2,
        limitNumber: 20,
        skip: 20,
      });

      (getSorting as jest.Mock).mockReturnValue({
        sortField: 'originalUrl',
        sortDirection: 1,
      });

      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockResolvedValue(urls);

      (Url.find as jest.Mock).mockReturnValue({
        sort,
        skip,
        limit,
      });

      (Url.countDocuments as jest.Mock).mockResolvedValue(45);

      const result = await getAllUrlsService({
        page: '2',
        limit: '20',
        sortBy: 'originalUrl',
        sortOrder: 'asc',
      });

      expect(skip).toHaveBeenCalledWith(20);
      expect(limit).toHaveBeenCalledWith(20);

      expect(sort).toHaveBeenCalledWith({
        originalUrl: 1,
      });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 20,
        total: 45,
        totalPages: 3,
      });
    });
  });

  // ==================================================
  // disableUrlByAdmin
  // ==================================================

  describe('disableUrlByAdmin', () => {
    test('should disable a URL successfully', async () => {
      const url = {
        _id: 'url-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        isActive: true,
        save: jest.fn().mockResolvedValue(undefined),
      };

      (Url.findById as jest.Mock).mockResolvedValue(url);

      const result = await disableUrlByAdmin('url-id');

      expect(Url.findById).toHaveBeenCalledWith('url-id');

      expect(url.isActive).toBe(false);

      expect(url.save).toHaveBeenCalled();

      expect(result).toBe(url);
    });

    test('should throw 404 if URL does not exist', async () => {
      (Url.findById as jest.Mock).mockResolvedValue(null);

      await expect(disableUrlByAdmin('url-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Url not found',
      });

      expect(Url.findById).toHaveBeenCalledWith('url-id');
    });

    test('should save the URL after disabling it', async () => {
      const save = jest.fn().mockResolvedValue(undefined);

      const url = {
        _id: 'url-id',
        isActive: true,
        save,
      };

      (Url.findById as jest.Mock).mockResolvedValue(url);

      await disableUrlByAdmin('url-id');

      expect(url.isActive).toBe(false);
      expect(save).toHaveBeenCalledTimes(1);
    });
  });

  // ==================================================
  // deleteUrlByAdmin
  // ==================================================

  describe('deleteUrlByAdmin', () => {
    test('should delete a URL successfully', async () => {
      const url = {
        _id: 'url-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        isActive: true,
      };

      (Url.findById as jest.Mock).mockResolvedValue(url);

      (Url.deleteOne as jest.Mock).mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      });

      await deleteUrlByAdmin('url-id');

      expect(Url.findById).toHaveBeenCalledWith('url-id');

      expect(Url.deleteOne).toHaveBeenCalledWith(url);
    });

    test('should throw 404 if URL does not exist', async () => {
      (Url.findById as jest.Mock).mockResolvedValue(null);

      await expect(deleteUrlByAdmin('url-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Url not found',
      });

      expect(Url.findById).toHaveBeenCalledWith('url-id');

      expect(Url.deleteOne).not.toHaveBeenCalled();
    });
  });
});
