import authService from '../services/authService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const signUp = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const newUser = await authService.signUp({ username, email, password });
    res.status(201).json(newUser);
});

const verifyAccount = asyncHandler(async (req, res) => {
    const { token } = req.query;
    await authService.verifyAccount(token);
    res.redirect('http://localhost:5173/verify-sign-up');
});

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await authService.login(username, password);
    res.status(200).json(user);
});

const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const newAccessToken = await authService.refreshToken(refreshToken);
    res.status(200).json({ accessToken: newAccessToken });
});

const resetPassword = asyncHandler(async (req, res) => {
    if (!req.body || !req.body.email) {
        throw new AppError('No data provided', 400, 'NO_DATA_PROVIDED');
    }

    const email = req.body.email;
    const result = await authService.resetPassword(email);
    if (result) {
        res.status(200).json({ message: 'Password reset email sent successfully' });
    }
});

const verifyResetToken = asyncHandler(async (req, res) => {
    if (!req.body || !req.body.resetToken || !req.body.newPassword) {
        throw new AppError('No data provided', 400, 'NO_DATA_PROVIDED');
    }

    const { resetToken, newPassword } = req.body;
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