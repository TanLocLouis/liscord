import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { JwtPayload } from 'jsonwebtoken';

dotenv.config();

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || 'your_access_token_secret';

type TokenPayload = {
    user_id: string;
    username: string;
    email?: string;
};

export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
}

export function generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): (JwtPayload & TokenPayload) | null {
    try {
        const payload = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);
        if (typeof payload === 'string') {
            return null;
        }
        return payload as JwtPayload & TokenPayload;
    } catch (err) {
        return null;
    }
}

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken
};