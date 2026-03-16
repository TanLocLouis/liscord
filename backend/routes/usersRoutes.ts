import express from 'express';
const router = express.Router();

import usersController from '../controllers/usersController.js';
import { authenticate } from '../middleware/authenticate.js';
import { avatarUploadMiddleware } from '../middleware/avatarUploadMiddleware.js';

// GET /api/users/profile/:user_id/me
router.get('/profile/:user_id/me', authenticate, usersController.getMyProfile);

// GET /api/users/profile/:user_id
router.get('/profile/:user_id', usersController.getUserProfile);

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

// PATCH /api/users/bio
router.patch('/bio',
    authenticate,
    usersController.updateUserBio
);

export default router;