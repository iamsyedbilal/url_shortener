import Url from '../models/url.model.js';
import ApiError from '../utils/apiError.js';

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
