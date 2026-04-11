import usersModel from "../models/usersModel.js";
import passwordUtils from "../utils/password.js";
import AppError from "../utils/AppError.js";
import { uploadAvatarToS3 } from '../utils/s3AvatarStorage.js';
import type { Express } from 'express';

async function getMyProfile(userId: string) {
    const user = await usersModel.getMyProfile(userId);
    if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return user;
}

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

async function updateUserBio(userId: string, bio: string) {
    const user = await usersModel.getUserProfile(userId);
    if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    const updated = await usersModel.updateUserBio(userId, bio);
    if (!updated) {
        throw new AppError('Failed to update bio', 500, 'BIO_UPDATE_FAILED');
    }
    return updated;
}

async function searchUsers(searchQuery: string) {
    if (!searchQuery || searchQuery.trim().length === 0) {
        throw new AppError('Search query is required', 400, 'EMPTY_SEARCH_QUERY');
    }

    const users = await usersModel.searchUsers(searchQuery.trim(), 20);
    return users;
}

async function setMyPublicEncryptionKey(userId: string, publicKey: string, algorithm: string = 'ECDH-P256') {
    const normalizedUserId = userId?.trim();
    const normalizedPublicKey = publicKey?.trim();

    if (!normalizedUserId) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    if (!normalizedPublicKey) {
        throw new AppError('Public key is required', 400, 'MISSING_PUBLIC_KEY');
    }

    const updated = await usersModel.upsertPublicEncryptionKey(normalizedUserId, normalizedPublicKey, algorithm);
    if (!updated) {
        throw new AppError('Failed to update public key', 500, 'PUBLIC_KEY_UPDATE_FAILED');
    }

    return {
        message: 'Public encryption key updated',
    };
}

async function getUserPublicEncryptionKey(userId: string) {
    const normalizedUserId = userId?.trim();

    if (!normalizedUserId) {
        throw new AppError('User id is required', 400, 'NO_USER_ID');
    }

    const key = await usersModel.getPublicEncryptionKeyByUserId(normalizedUserId);
    if (!key) {
        throw new AppError('Public encryption key not found', 404, 'PUBLIC_KEY_NOT_FOUND');
    }

    return {
        userId: key.user_id,
        publicKey: key.public_key,
        algorithm: key.algorithm,
        updatedAt: key.updated_at,
    };
}

export default {
    getMyProfile,
    getUserProfile,
    updateUserPassword,
    updateUserAvatar,
    updateUserBio,
    searchUsers,
    setMyPublicEncryptionKey,
    getUserPublicEncryptionKey,
}