import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/apiError.js';
import { verifyAccessToken } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: unknown;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized: Invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new ApiError(401, 'Unauthorized: Missing token');
    }

    const decoded = verifyAccessToken(token);

    console.log(decoded);

    req.user = decoded as any;

    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Access token expired'));
      return;
    }

    next(
      error instanceof Error
        ? error
        : new ApiError(500, 'Authentication failed')
    );
  }
};

export default authMiddleware;
