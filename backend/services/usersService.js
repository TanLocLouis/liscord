import usersModel from "../models/usersModel.js";
import passwordUtils from "../utils/password.js";

async function getUserProfile(userId) {
    try {
        return usersModel.getUserProfile(userId);
    } catch (err) {
        throw new Error('Failed to retrieve user profile');
    }
}

async function updateUserPassword(userId, oldPassword, newPassword) {
    try {
        const userPassword = await usersModel.getUserPassword(userId);
        const passwordMatch = await passwordUtils.comparePassword(
            oldPassword,
            userPassword
        );

        if (!passwordMatch) {
            throw new Error('Current password is incorrect');
        }

        const newPasswordHash = await passwordUtils.hashPassword(newPassword);
        const result = await usersModel.updateUserPassword(userId, newPasswordHash);

        return result;
    } catch (err) {
        throw new Error('Failed to update user password: ', err.message);
    }
}

export default {
    getUserProfile,
    updateUserPassword
}