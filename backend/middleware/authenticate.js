import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return next(); // No token provided, proceed as guest
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return next(); // No token provided, proceed as guest
    }
    
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log('[STATUS] Invalid token ', err);
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user; // Attach user info to request
        next();
    });
}

export {
    authenticate
}
