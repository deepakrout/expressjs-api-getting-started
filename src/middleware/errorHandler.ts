import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const requestId = req.headers['x-request-id'];
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError && err.isOperational ? err.message : 'Internal Server Error';

  logger.error(`[${requestId}] ${err.message}`);
  if (statusCode === 500) logger.error(err.stack || '');

  res.status(statusCode).json({
    success: false,
    message,
    requestId,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
