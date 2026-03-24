import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import AppError from '../utils/AppError.js';

const authenticate: RequestHandler = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    // Check if token is provided
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Check if JWT secret is configured
    const jwtSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
    if (!jwtSecret) {
        throw new AppError('JWT secret is not configured', 500, 'JWT_SECRET_MISSING');
    }

    // Verify token; if valid, attach user info to request object
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            // console.log('[STATUS] Invalid token ', err);
            return res.status(403).json({ message: 'Invalid token' });
        }

        if (typeof user === 'string') {
            req.user = { username: user };
        } else if (user && typeof user === 'object' 
            && 'user_id' in user && typeof user.user_id === 'string'
            && 'username' in user && typeof user.username === 'string' 
            && 'user_id' in user && typeof user.user_id === 'string') {
            req.user = {
                user_id: user.user_id,
                username: user.username,
                ...(typeof user.email === 'string' ? { email: user.email } : {})
            };
        }

        next();
    });
}

export {
    authenticate
}
