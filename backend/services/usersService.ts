import usersModel from "../models/usersModel.js";
import passwordUtils from "../utils/password.js";
import AppError from "../utils/AppError.js";
import { uploadAvatarToS3 } from '../utils/s3AvatarStorage.js';
import type { Express } from 'express';

async function getUserProfile(userId: string) {
    const user = await usersModel.getUserProfile(userId);
    if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return user;
}

async function updateUserPassword(userId: string, oldPassword: string, newPassword: string) {
    const userPassword = await usersModel.getUserPassword(userId);
    if (!userPassword) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const passwordMatch = await passwordUtils.comparePassword(
        oldPassword,
        userPassword
    );

    if (!passwordMatch) {
        throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
    }

    const newPasswordHash = await passwordUtils.hashPassword(newPassword);
    const result = await usersModel.updateUserPassword(userId, newPasswordHash);

    return result;
}

async function updateUserAvatar(userId: string, avatarFile: Express.Multer.File) {
    const userProfile = await usersModel.getUserProfile(userId);
    if (!userProfile) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const avatarUrl = await uploadAvatarToS3({
        userId,
        fileBuffer: avatarFile.buffer,
        mimeType: avatarFile.mimetype,
    });

    const updated = await usersModel.updateUserAvatar(userId, avatarUrl);
    if (!updated) {
        throw new AppError('Failed to update avatar', 500, 'AVATAR_UPDATE_FAILED');
    }

    return avatarUrl;
}

export default {
    getUserProfile,
    updateUserPassword,
    updateUserAvatar,
}