import express from 'express';
const router = express.Router();

import authController from '../controllers/authController.js';
import validateData from '../middleware/validateData.js';
import { body } from 'express-validator';

// POST /api/auth/sign-up
router.post('/sign-up',
    [
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 6 characters long'),
        body('email').isEmail().withMessage('Invalid email address'),
    ],
    validateData,
    authController.signUp
);

// POST /api/auth/verify-account
router.get('/verify-account',
    authController.verifyAccount
);

// POST /api/auth/login
router.post('/login',
    authController.login
);

// POST /api/auth/refresh-token
router.post('/refresh-token',
    authController.refreshToken
);

// POST /api/auth/reset-password
router.post('/reset-password', 
    authController.resetPassword
);

// POST /api/auth/verify-reset-token
router.post('/verify-reset-token', 
    authController.verifyResetToken
);

export default router;

