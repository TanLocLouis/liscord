import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';
import AppError from '../utils/AppError.js';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(new AppError('Only jpeg, png, webp, and gif images are allowed', 400, 'INVALID_AVATAR_TYPE'));
        return;
    }

    cb(null, true);
};

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 1,
    },
    fileFilter,
});

const avatarUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    upload.single('avatar')(req, res, (err: unknown) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new AppError('Avatar exceeds max file size of 5MB', 400, 'AVATAR_FILE_TOO_LARGE'));
            }

            return next(new AppError(err.message, 400, 'AVATAR_UPLOAD_ERROR'));
        }

        if (err) {
            return next(err);
        }

        next();
    });
};

export {
    avatarUploadMiddleware,
};
