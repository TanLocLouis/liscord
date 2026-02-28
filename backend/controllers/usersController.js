import usersService from '../services/usersService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const userProfile = await usersService.getUserProfile(userId);
    res.status(200).json({ user: userProfile });
});

const updateUserPassword = asyncHandler(async (req, res) => {
    if (!req.body || !req.body.currentPassword || !req.body.newPassword) {
        throw new AppError('No data provided', 400, 'NO_DATA_PROVIDED');
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.username;

    await usersService.updateUserPassword(userId, currentPassword, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
});

export default {
    getUserProfile,
    updateUserPassword,
}