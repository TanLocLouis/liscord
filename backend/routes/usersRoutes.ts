import express from 'express';
const router = express.Router();

import usersController from '../controllers/usersController.js';
import { authenticate } from '../middleware/authenticate.js';
import { avatarUploadMiddleware } from '../middleware/avatarUploadMiddleware.js';

// GET /api/users/profile
router.get('/profile/:id', usersController.getUserProfile);

// PATCH /api/users/password
router.patch('/password',
    authenticate,
    usersController.updateUserPassword
);

// PATCH /api/users/avatar
router.patch('/avatar',
    authenticate,
    avatarUploadMiddleware,
    usersController.updateUserAvatar
);

export default router;