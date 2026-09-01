import { Request, Response } from 'express';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { loginUser, registerUser } from '../services/auth.services.js';
import ApiError from '../utils/apiError.js';
import { setRefreshTokenCookie } from '../utils/cookie.js';

/**
 * Register a new user
 * @param req - Express request object containing user registration data
 * @param res - Express response object
 * @returns JSON response with registered user data
 */

export const register = asyncHandler(async (req: Request, res: Response) => {
  const validateData = registerSchema.parse(req.body);

  // Proceed with registration logic using validateData
  const user = await registerUser(validateData);

  if (!user) {
    throw new ApiError(400, 'Failed to register user');
  }

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
  const validateData = loginSchema.parse(req.body);

  // Proceed with login logic using validateData
  const { user, accessToken, refreshToken } = await loginUser(validateData);

  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json(
    new ApiResponse(200, 'User logged in successfully', {
      user,
      accessToken,
    })
  );
});
