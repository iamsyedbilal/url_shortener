import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/apiError.js';

interface AuthorizedRequest extends Request {
  user?: {
    role: string;
  };
}

interface AuthorizeMiddleware {
  (req: AuthorizedRequest, res: Response, next: NextFunction): void;
}

const authorize = (...allowedRoles: string[]): AuthorizeMiddleware => {
  return (req: AuthorizedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication is required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "You don't have access to this page");
    }

    next();
  };
};

export default authorize;
