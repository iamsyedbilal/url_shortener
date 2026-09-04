import Url from '../models/url.model.js';
import User from '../models/user.model.js';
import ApiError from '../utils/apiError.js';
import { getPagination } from '../utils/getPagination.js';
import { getSorting } from '../utils/getSorting .js';

interface BaseQueryOptions {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}

interface GetAllUsersOptions extends BaseQueryOptions {
  role?: string;
}

interface GetAllUrlsOptions extends BaseQueryOptions {
  isActive?: string;
}

export const getAllUsersService = async ({
  page = '1',
  limit = '10',
  search,
  role,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}: GetAllUsersOptions) => {
  const { pageNumber, limitNumber, skip } = getPagination(page, limit);

  const filter: Record<string, unknown> = {};

  // Filter By Role
  if (role === 'user' || role === 'admin') {
    filter.role = role;
  }

  // Search Username and Email
  if (search?.trim()) {
    filter.$or = [
      { username: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const { sortField, sortDirection } = getSorting(sortBy, sortOrder, [
    'createdAt',
    'updatedAt',
    'username',
    'email',
  ]);

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNumber),
    User.countDocuments(filter),
  ]);

  if (!users.length) {
    throw new ApiError(404, 'No user found');
  }

  return {
    users,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

export const getAllUrlsService = async ({
  page = '1',
  limit = '10',
  isActive,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  search,
}: GetAllUrlsOptions) => {
  const { pageNumber, limitNumber, skip } = getPagination(page, limit);

  const { sortField, sortDirection } = getSorting(sortBy, sortOrder, [
    'createdAt',
    'updatedAt',
    'shortCode',
    'originalUrl',
  ]);

  const filter: Record<string, unknown> = {};

  if (isActive === 'true') {
    filter.isActive = true;
  }

  if (isActive === 'false') {
    filter.isActive = false;
  }

  if (search?.trim()) {
    filter.$or = [
      {
        shortCode: {
          $regex: search.trim(),
          $options: 'i',
        },
      },
      {
        originalUrl: {
          $regex: search.trim(),
          $options: 'i',
        },
      },
    ];
  }

  const [urls, total] = await Promise.all([
    Url.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNumber),
    Url.countDocuments(filter),
  ]);

  return {
    urls,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

export const disableUrlByAdmin = async (id: string) => {
  const url = await Url.findById(id);

  if (!url) {
    throw new ApiError(404, 'Url not found');
  }

  url.isActive = false;
  await url.save();

  return url;
};

export const deleteUrlByAdmin = async (id: string) => {
  const url = await Url.findById(id);

  if (!url) {
    throw new ApiError(404, 'Url not found');
  }

  await Url.deleteOne(url);
};
