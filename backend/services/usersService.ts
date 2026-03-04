import usersModel from "../models/usersModel.js";
import passwordUtils from "../utils/password.js";
import AppError from "../utils/AppError.js";

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

export default {
    getUserProfile,
    updateUserPassword
}