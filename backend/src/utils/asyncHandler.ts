import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to automatically catch errors
 * and forward them to the Express error middleware.
 * Eliminates repetitive try/catch blocks in controllers.
 */
export const asyncHandler = (
  fn: (req: any, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
