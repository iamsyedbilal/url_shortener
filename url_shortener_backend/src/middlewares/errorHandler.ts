import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError.js';

const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    const { statusCode, message } = err;
    res.status(statusCode).json({
      status: 'error',
      statusCode,
      message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Internal Server Error',
    });
  }
};

export default errorHandler;
