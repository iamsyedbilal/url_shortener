import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import Url from '../models/url.model.js';
import {
  deleteUrlByAdmin,
  disableUrlByAdmin,
} from '../services/admin.services.js';

/**
 * Get All Users
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with the all users data
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find();

  if (users.length === 0) {
    throw new ApiError(404, 'No user found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'Users fetched successfully', users));
});

/**
 * Get All Urls
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with the all urls data
 */
export const getAllUrls = asyncHandler(async (req: Request, res: Response) => {
  const urls = await Url.find();

  if (urls.length === 0) {
    throw new ApiError(404, 'No user found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'Urls fetched successfully', urls));
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
