import express from 'express';
const router = express.Router();

import usersController from '../controllers/usersController.js';
import { authenticate } from '../middleware/authenticate.js';

// GET /api/users/profile
router.get('/profile/:id', usersController.getUserProfile);

// PATCH /api/users/password
router.patch('/password',
    authenticate,
    usersController.updateUserPassword
);

export default router;