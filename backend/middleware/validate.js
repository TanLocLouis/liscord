function validateBin(req, res, next) {
    const bin = req.body.data;
    const idPattern = /^[a-zA-Z0-9_-]{4,20}$/; // Example pattern: alphanumeric, underscores, hyphens, 4-20 chars

    // Validate ID
    if (!idPattern.test(bin.id)) {
        // console.log('[STATUS] Invalid Bin ID format', bin.id);
        return res.status(400).json({ message: 'Invalid Bin ID format' });
    }

    // Validate text
    if (typeof bin.text !== 'string' || bin.text.length === 0 || bin.text.length > 10000) {
        // console.log('[STATUS] Invalid text content');
        return res.status(400).json({ message: 'Invalid text content' });
    }

    // Validate password (if provided)
    if (bin.password && (typeof bin.password !== 'string' || bin.password.length > 100)) {
        // console.log('[STATUS] Invalid password format');
        return res.status(400).json({ message: 'Invalid password format' });
    }

    // Validate expireTime
    if (typeof bin.expireTime !== 'number' || bin.expireTime <= 0 || bin.expireTime > 604800000) { // Max 7 days
        // console.log('[STATUS] Invalid expireTime', bin.expireTime);
        return res.status(400).json({ message: 'Invalid expireTime' });
    }

    // If all validations pass, proceed to the next middleware/handler
    next();
}

module.exports = { validateBin };