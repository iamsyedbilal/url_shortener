import { generateShortCode } from '../utils/urlGenerator.js';
import Url from '../models/url.model.js';
import { BaseURL } from '../utils/constant.js';
import ApiError from '../utils/apiError.js';

export const createUrl = async (originalUrl: string, userId: string) => {
  const existingUrl = await Url.findOne({
    originalUrl,
    userId,
  });

  if (existingUrl) {
    return {
      id: existingUrl._id,
      originalUrl: existingUrl.originalUrl,
      shortCode: existingUrl.shortCode,
      shortUrl: `${BaseURL}/${existingUrl.shortCode}`,
    };
  }

  let shortCode: string;

  do {
    shortCode = generateShortCode(6);
  } while (await Url.findOne({ shortCode }));

  const url = await Url.create({
    originalUrl,
    shortCode,
    userId,
  });

  return {
    id: url._id,
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    shortUrl: `${BaseURL}/${url.shortCode}`,
  };
};

export const getUrl = async (userId: string) => {
  const urls = await Url.find({ userId }).sort({ createdAt: -1 });

  return urls.map((url) => ({
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    shortUrl: `${BaseURL}/${url.shortCode}`,
  }));
};

export const disableUserUrl = async (id: string, userId: string) => {
  const url = await Url.findOne({
    _id: id,
    userId,
  });

  if (!url) {
    throw new ApiError(404, 'URL not found');
  }

  if (!url.isActive) {
    throw new ApiError(400, 'URL is already disabled');
  }

  url.isActive = false;

  await url.save();

  return url;
};

export const deleteUserUrl = async (id: string, userId: string) => {
  const url = await Url.findOne({
    _id: id,
    userId,
  });

  if (!url) {
    throw new ApiError(404, 'URL not found');
  }

  await Url.deleteOne(url);
};

export const redirectToOriginalUrl = async (shortCode: string) => {
  const url = await Url.findOne({ shortCode });

  if (!url) {
    throw new ApiError(404, 'Short URL not found');
  }

  if (!url.isActive) {
    throw new ApiError(410, 'Short URL is disabled');
  }

  url.clickCount += 1;

  await url.save();

  return url.originalUrl;
};
