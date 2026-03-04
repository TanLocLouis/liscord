import type { RequestHandler } from 'express';

type BinPayload = {
    id: string;
    text: string;
    password?: string;
    expireTime: number;
};

const validateBin: RequestHandler = (req, res, next) => {
    const bin = req.body.data;
    const idPattern = /^[a-zA-Z0-9_-]{4,20}$/; // Example pattern: alphanumeric, underscores, hyphens, 4-20 chars

    if (!bin || typeof bin !== 'object') {
        return res.status(400).json({ message: 'Invalid payload' });
    }

    const typedBin = bin as BinPayload;

    // Validate ID
    if (!idPattern.test(typedBin.id)) {
        // console.log('[STATUS] Invalid Bin ID format', bin.id);
        return res.status(400).json({ message: 'Invalid Bin ID format' });
    }

    // Validate text
    if (typeof typedBin.text !== 'string' || typedBin.text.length === 0 || typedBin.text.length > 10000) {
        // console.log('[STATUS] Invalid text content');
        return res.status(400).json({ message: 'Invalid text content' });
    }

    // Validate password (if provided)
    if (typedBin.password && (typeof typedBin.password !== 'string' || typedBin.password.length > 100)) {
        // console.log('[STATUS] Invalid password format');
        return res.status(400).json({ message: 'Invalid password format' });
    }

    // Validate expireTime
    if (typeof typedBin.expireTime !== 'number' || typedBin.expireTime <= 0 || typedBin.expireTime > 604800000) { // Max 7 days
        // console.log('[STATUS] Invalid expireTime', bin.expireTime);
        return res.status(400).json({ message: 'Invalid expireTime' });
    }

    // If all validations pass, proceed to the next middleware/handler
    next();
};

export { validateBin };