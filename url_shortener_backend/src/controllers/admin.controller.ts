import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

import {
  deleteUrlByAdmin,
  disableUrlByAdmin,
  getAllUrlsService,
  getAllUsersService,
} from '../services/admin.services.js';

/**
 * Get All Users
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with the all users data
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, role, sortBy, sortOrder } = req.query as Record<
    string,
    string
  >;

  const data = await getAllUsersService({
    page,
    limit,
    search,
    role,
    sortBy,
    sortOrder,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Users fetched successfully', data));
});

/**
 * Get All Urls
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with the all urls data
 */
export const getAllUrls = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, isActive, sortBy, sortOrder } =
    req.query as Record<string, string>;

  const data = await getAllUrlsService({
    page,
    limit,
    isActive,
    sortBy,
    sortOrder,
    search,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Urls fetched successfully', data));
});

export const disableAdminUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const url = await disableUrlByAdmin(Array.isArray(id) ? id[0] : id);

    return res.status(200).json(new ApiResponse(200, 'Url is disabled', url));
  }
);

export const deleteAdminUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await deleteUrlByAdmin(Array.isArray(id) ? id[0] : id);

    return res.status(204).send();
  }
);
