import usersService from '../services/usersService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

type UpdatePasswordBody = {
    currentPassword: string;
    newPassword: string;
};

const getMyProfile = asyncHandler(async (req, res) => {
    const user_id = req.user?.user_id;
    if (!user_id) {
        throw new AppError('No user id provided', 400, 'NO_USER_ID');
    }
    const userProfile = await usersService.getMyProfile(user_id);
    res.status(200).json({ user: userProfile });
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user_id = req.params.user_id;
    if (!user_id) {
        throw new AppError('No user id provided', 400, 'NO_USER_ID');
    }
    const userProfile = await usersService.getUserProfile(user_id);
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

const updateUserAvatar = asyncHandler(async (req, res) => {
    if (!req.user?.username) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    if (!req.file) {
        throw new AppError('No avatar file provided', 400, 'NO_AVATAR_FILE');
    }

    const avatarUrl = await usersService.updateUserAvatar(req.user.username, req.file);
    res.status(200).json({ message: 'Avatar updated successfully', avatarUrl });
});

type UpdateBioBody = {
    bio: string;
};

const updateUserBio = asyncHandler(async (req, res) => {
    if (!req.user?.username) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }
    const body = req.body as Partial<UpdateBioBody>;
    if (typeof body.bio !== 'string') {
        throw new AppError('No bio provided', 400, 'NO_DATA_PROVIDED');
    }
    await usersService.updateUserBio(req.user.username, body.bio);
    res.status(200).json({ message: 'Bio updated successfully' });
});

export default {
    getMyProfile,
    getUserProfile,
    updateUserPassword,
    updateUserAvatar,
    updateUserBio,
}