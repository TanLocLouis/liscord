import usersService from '../services/usersService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

type UpdatePasswordBody = {
    currentPassword: string;
    newPassword: string;
};

const getUserProfile = asyncHandler(async (req, res) => {
    const userIdParam = req.params.id;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
    if (!userId) {
        throw new AppError('No user id provided', 400, 'NO_USER_ID');
    }
    const userProfile = await usersService.getUserProfile(userId);
    res.status(200).json({ user: userProfile });
});

const updateUserPassword = asyncHandler(async (req, res) => {
    const body = req.body as Partial<UpdatePasswordBody>;
    if (!body.currentPassword || !body.newPassword) {
        throw new AppError('No data provided', 400, 'NO_DATA_PROVIDED');
    }

    const { currentPassword, newPassword } = body as UpdatePasswordBody;
    if (!req.user?.username) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }
    const userId = req.user.username;

    await usersService.updateUserPassword(userId, currentPassword, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
});

export default {
    getUserProfile,
    updateUserPassword,
}