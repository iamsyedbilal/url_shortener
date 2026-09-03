import { Request, Response } from 'express';
import User from '../models/user.model.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Get authenticated user details
 * @param req - Express request object containing authenticated user
 * @param res - Express response object
 * @returns JSON response with user data
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const authenticatedUser = req.user as { userId?: string } | undefined;

  if (!authenticatedUser?.userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const user = await User.findById(authenticatedUser.userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, 'User fetched successfully', user));
});

/**
 * Get all users
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with all user data
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find();

  if (!users) {
    throw new ApiError(400, 'No users found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, 'Users fetched successfully', users));
});
