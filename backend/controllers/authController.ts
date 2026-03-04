import authService from '../services/authService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import type { Request } from 'express';

type SignUpBody = {
    username: string;
    email: string;
    password: string;
};

type LoginBody = {
    username: string;
    password: string;
};

type RefreshTokenBody = {
    refreshToken: string;
};

type ResetPasswordBody = {
    email: string;
};

type VerifyResetTokenBody = {
    resetToken: string;
    newPassword: string;
};

const signUp = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body as SignUpBody;
    const newUser = await authService.signUp({ username, email, password });
    res.status(201).json(newUser);
});

const verifyAccount = asyncHandler(async (req, res) => {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    if (!token) {
        throw new AppError('Invalid token', 400, 'INVALID_TOKEN');
    }
    await authService.verifyAccount(token);
    res.redirect('http://localhost:5173/verify-sign-up');
});

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body as LoginBody;
    const user = await authService.login(username, password);
    res.status(200).json(user);
});

const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as RefreshTokenBody;
    const newAccessToken = await authService.refreshToken(refreshToken);
    res.status(200).json({ accessToken: newAccessToken });
});

const resetPassword = asyncHandler(async (req, res) => {
    const body = req.body as Partial<ResetPasswordBody>;
    if (!body.email) {
        throw new AppError('No data provided', 400, 'NO_DATA_PROVIDED');
    }

    const email = body.email;
    const result = await authService.resetPassword(email);
    if (result) {
        res.status(200).json({ message: 'Password reset email sent successfully' });
    }
});

const verifyResetToken = asyncHandler(async (req, res) => {
    const body = req.body as Partial<VerifyResetTokenBody>;
    if (!body.resetToken || !body.newPassword) {
        throw new AppError('No data provided', 400, 'NO_DATA_PROVIDED');
    }

    const { resetToken, newPassword } = body as VerifyResetTokenBody;
    const result = await authService.verifyResetToken(resetToken, newPassword);
    if (result) {
        res.status(200).json({ message: 'Reset token is valid' });
    }
});

export default {
    signUp,
    verifyAccount,
    login,
    refreshToken,
    resetPassword,
    verifyResetToken
}