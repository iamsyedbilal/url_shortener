import { Request, Response } from 'express';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  loginUser,
  logoutUser,
  registerUser,
} from '../services/auth.services.js';
import ApiError from '../utils/apiError.js';
import { setRefreshTokenCookie } from '../utils/cookie.js';

/**
 * Register a new user
 * @param req - Express request object containing user registration data
 * @param res - Express response object
 * @returns JSON response with registered user data
 */

export const register = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);

  // Proceed with registration logic using validatedData
  const user = await registerUser(validatedData);

  res
    .status(201)
    .json(new ApiResponse(201, 'User registered successfully', user));
});

/**
 * Login a new user
 * @param req - Express request object containing user login data
 * @param res - Express response object
 * @returns JSON response with logged-in user data
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);

  // Proceed with login logic using validatedData
  const { user, accessToken, refreshToken } = await loginUser(
    validatedData,
    req
  );

  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json(
    new ApiResponse(200, 'User logged in successfully', {
      user,
      accessToken,
    })
  );
});

/**
 * Logout a user
 * @param req - Express request object containing user registration data
 * @param res - Express response object
 * @returns JSON response with success message
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is missing');
  }

  await logoutUser(refreshToken, res);

  res.status(200).json(new ApiResponse(200, 'Logged out successfully', false));
});
