import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { createUrlSchema } from '../validators/url.validator.js';
import {
  createUrl,
  deleteUserUrl,
  disableUserUrl,
  getUrl,
  redirectToOriginalUrl,
} from '../services/url.services.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Create a short URL
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with the created short URL data
 */
export const createShortUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const url = req.body;

    const userId = (req.user as { userId?: string } | undefined)?.userId ?? '';

    const validatedData = createUrlSchema.parse(url);

    const shortUrl = await createUrl(validatedData.originalUrl, userId);

    res
      .status(201)
      .json(new ApiResponse(201, 'Short url is created', shortUrl));
  }
);

/**
 * Get User Url
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with the short URL data
 */
export const getUrls = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { userId?: string } | undefined)?.userId ?? '';

  const urls = await getUrl(userId);

  res.status(200).json(new ApiResponse(200, 'User urls fetched', urls));
});

/**
 * Disable Url
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with the disable short URL data
 */
export const disableUrl = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as { userId?: string } | undefined)?.userId ?? '';

  const url = await disableUserUrl(Array.isArray(id) ? id[0] : id, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Short URL disabled successfully', url));
});

/**
 * Delete Url
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with the Deleted url
 */
export const deleteUrl = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as { userId?: string } | undefined)?.userId ?? '';

  await deleteUserUrl(Array.isArray(id) ? id[0] : id, userId);

  return res.status(204).send();
});

/**
 * Redirect URL
 * @param req - Express request object
 * @param res - Express response object
 * @returns Redirects the user to the original URL
 */
export const redirectUrl = asyncHandler(async (req: Request, res: Response) => {
  const { shortCode } = req.params;

  const originalUrl = await redirectToOriginalUrl(
    Array.isArray(shortCode) ? shortCode[0] : shortCode
  );

  return res.redirect(originalUrl);
});
