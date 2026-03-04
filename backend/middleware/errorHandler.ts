import AppError from '../utils/AppError.js';
import type { ErrorRequestHandler } from 'express';

/**
 * Global error handling middleware (must have 4 parameters).
 * Distinguishes between operational errors (AppError) and unexpected errors.
 */
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    void req;
    void next;
    // If it's an operational error we threw intentionally
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.code,
            message: err.message,
        });
    }

    // Unexpected / programming errors
    console.error('[ERROR]', err.stack || err);
    res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
    });
};

export default errorHandler;
