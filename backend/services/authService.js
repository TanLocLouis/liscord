import authModel from '../models/authModel.js';
import passwordUtil from '../utils/password.js';
import { sendMail } from '../utils/emailSender.js';
import jwtUtils from '../utils/jwt.js';
import jwt from '../utils/jwt.js';

const tokenMemory = new Map();

async function signUp(userData) {
    const user = {
        username: userData.username,
        email: userData.email,
        passwordHash: userData.passwordHash,
        isActive: false
    };

    // Hash password
    user.passwordHash = await passwordUtil.hashPassword(userData.password);

    // Check if username exists
    const exists = await authModel.isUserExisted(user.username);
    if (exists) {
        const err = new Error('User already exists');
        err.code = 'USER_EXISTS';
        throw err;
    }

    // Create user
    const result = await authModel.createUser(user);

    // Send verification email
    const token = await passwordUtil.genToken();
    tokenMemory.set(token, {
        username: user.username,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes expiry
    });
    const verificationLink = process.env.SERVER_URL + "/api/auth/verify-account?token=" + token;
    sendMail(user.email, verificationLink);

    return result;
}

async function verifyAccount(token) {
    const tokenData = tokenMemory.get(token);
    if (!tokenData) {
        const err = new Error('Invalid or expired token');
        err.code = 'INVALID_TOKEN';
        throw err;
    }

    if (Date.now() > tokenData.expiresAt) {
        tokenMemory.delete(token);
        const err = new Error('Token has expired');
        err.code = 'TOKEN_EXPIRED';
        throw err;
    }

    const result = await authModel.setActive(tokenData.username);
    tokenMemory.delete(token);

    return result;
}

async function login(username, password) {
    const user = await authModel.getUserByUsername(username);
    if (!user) {
        const err = new Error('User not found');
        err.code = 'USER_NOT_FOUND';
        throw err;
    }

    // Check if user is active
    if (!user.isActive) {
        const err = new Error('Account is not verified');
        err.code = 'ACCOUNT_INACTIVE';
        throw err;
    }

    // Check password
    const passwordMatch = await passwordUtil.comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
        const err = new Error('Invalid password');
        err.code = 'INVALID_PASSWORD';
        throw err;
    }

    // Generate tokens
    const refreshToken = jwtUtils.generateRefreshToken({ username: user.username, email: user.email });
    const accessToken = jwtUtils.generateAccessToken({ username: user.username });

    const userData = {
        username: user.username,
        email: user.email,
        isActive: user.isActive
    }

    return {
        data: userData,
        refreshToken,
        accessToken
    };
}

async function refreshToken(token) {
    try {
        const result = jwtUtils.verifyAccessToken(token);
        if (!result) {
            const err = new Error('Invalid token');
            err.code = 'INVALID_TOKEN';
            throw err;
        }

        const newAccessToken = jwt.generateAccessToken({ username: result.username });
        return newAccessToken;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            const error = new Error('Token has expired');
            error.code = 'TOKEN_EXPIRED';
            throw error;
        }
    }
}

async function resetPassword(email) {
    // Check if user exists
    const user = await authModel.getUserByEmail(email);

    if (!user) {
        const err = new Error('User not found');
        err.code = 'USER_NOT_FOUND';
        throw err;
    }

    // Send password reset email
    const token = await passwordUtil.genToken();
    tokenMemory.set(token, {
        username: user.username,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    const verificationLink = "http://localhost:5173" + "/reset-password-form?token=" + token;
    sendMail(user.email, verificationLink);
}

async function verifyResetToken(resetToken, newPassword) {
    const tokenData = tokenMemory.get(resetToken);

    if (!tokenData) {
        const err = new Error('Invalid or expired token');
        err.code = 'INVALID_TOKEN';
        throw err;
    }
    if (Date.now() > tokenData.expiresAt) {
        tokenMemory.delete(resetToken);
        const err = new Error('Token has expired');
        err.code = 'TOKEN_EXPIRED';
        throw err;
    }

    const result = await authModel.getUserByUsername(tokenData.username);

    const newPasswordHash = await passwordUtil.hashPassword(newPassword);
    await authModel.updatePassword(tokenData.username, newPasswordHash);

    tokenMemory.delete(resetToken);
    return result;
}

export default {
    signUp,
    verifyAccount,
    login,
    refreshToken,
    resetPassword,
    verifyResetToken,
}