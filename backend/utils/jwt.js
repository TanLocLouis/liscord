import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || 'your_access_token_secret';

export function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
}

export function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);
    } catch (err) {
        return null;
    }
}

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken
};