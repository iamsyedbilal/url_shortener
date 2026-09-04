import rateLimit from 'express-rate-limit';

const createRateLimiter = ({
  limit,
  message,
  windowMs = 15 * 60 * 1000, //15 minutes
}: {
  limit: number;
  message: string;
  windowMs?: number;
}) => {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message,
      success: false,
    },
  });
};

export const authRateLimiter = createRateLimiter({
  limit: 10,
  message: 'Too many authentication attempts. Please try again later.',
});

export const createUrlRateLimiter = createRateLimiter({
  limit: 30,
  message: 'Too many URLs created. Please try again later.',
});

export const apiRateLimiter = createRateLimiter({
  limit: 100,
  message: 'Too many requests. Please try again later.',
});
