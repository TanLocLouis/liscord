import authModel from '../models/authModel.js';
import passwordUtil from '../utils/password.js';
import { sendMail } from '../utils/emailSender.js';
import jwtUtils from '../utils/jwt.js';
import AppError from '../utils/AppError.js';
import { randomUUID } from 'node:crypto';

type SignUpInput = {
    username: string;
    email: string;
    password: string;
};

type TokenMemoryValue = {
    username: string;
    expiresAt: number;
};

const tokenMemory = new Map<string, TokenMemoryValue>();

async function signUp(userData: SignUpInput) {
    const user = {
        user_id: randomUUID(),
        username: userData.username,
        email: userData.email,
        passwordHash: '',
        isActive: false
    };

    // Hash password
    user.passwordHash = await passwordUtil.hashPassword(userData.password);

    // Check if username exists
    const exists = await authModel.isUserExisted(user.username);
    if (exists) {
        throw new AppError('User already exists', 409, 'USER_EXISTS');
    }

    // Check if email exists
    const userByEmail = await authModel.getUserByEmail(user.email);
    if (userByEmail) {
        if (userByEmail.is_active) {
            throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
        } else {
            await authModel.deleteUserByEmail(user.email);
        }
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

async function verifyAccount(token: string) {
    const tokenData = tokenMemory.get(token);
    if (!tokenData) {
        throw new AppError('Invalid or expired token', 400, 'INVALID_TOKEN');
    }

    if (Date.now() > tokenData.expiresAt) {
        tokenMemory.delete(token);
        throw new AppError('Token has expired', 400, 'TOKEN_EXPIRED');
    }

    const result = await authModel.setActive(tokenData.username);
    tokenMemory.delete(token);

    return result;
}

async function login(username: string, password: string) {
    const userByUsername = await authModel.getUserByUsername(username);
    const userByEmail = await authModel.getUserByEmail(username);

    const user = userByUsername || userByEmail;

    if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if user is active
    if (!user.is_active) {
        throw new AppError('Account is not verified', 403, 'ACCOUNT_INACTIVE');
    }

    // Check password
    const passwordMatch = await passwordUtil.comparePassword(password, user.password_hash);
    if (!passwordMatch) {
        throw new AppError('Invalid password', 401, 'INVALID_PASSWORD');
    }

    // Generate tokens
    const refreshToken = jwtUtils.generateRefreshToken({user_id: user.user_id, username: user.username, email: user.email });
    const accessToken = jwtUtils.generateAccessToken({user_id: user.user_id, username: user.username });

    const userData = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isActive: user.is_active
    }
    
    return {
        data: userData,
        refreshToken,
        accessToken
    };
}

async function refreshToken(token: string) {
    try {
        const result = jwtUtils.verifyAccessToken(token);
        if (!result || typeof result.username !== 'string') {
            throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
        }

        const newAccessToken = jwtUtils.generateAccessToken({ user_id: result.user_id, username: result.username });
        return newAccessToken;
    } catch (err) {
        if (err instanceof AppError) throw err;
        if (err instanceof Error && err.name === 'TokenExpiredError') {
            throw new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
        }
        throw err;
    }
}

async function resetPassword(email: string): Promise<boolean> {
    // Check if user exists
    const user = await authModel.getUserByEmail(email);

    if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Send password reset email
    const token = await passwordUtil.genToken();
    tokenMemory.set(token, {
        username: user.username,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    const verificationLink = "http://localhost:5173" + "/reset-password-form?token=" + token;

    try {
        await sendMail(user.email, verificationLink);
        return true;
    } catch (err) {
        tokenMemory.delete(token);
        throw new AppError('Failed to send email', 500, 'EMAIL_SEND_FAILED');
    }
}

async function verifyResetToken(resetToken: string, newPassword: string) {
    const tokenData = tokenMemory.get(resetToken);

    if (!tokenData) {
        throw new AppError('Invalid or expired token', 400, 'INVALID_TOKEN');
    }
    if (Date.now() > tokenData.expiresAt) {
        tokenMemory.delete(resetToken);
        throw new AppError('Token has expired', 400, 'TOKEN_EXPIRED');
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