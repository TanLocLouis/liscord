/**
 * Wraps an async route handler to automatically catch errors
 * and forward them to Express error handling middleware via next().
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
