/**
 * Wraps an async route handler to automatically catch errors
 * and forward them to Express error handling middleware via next().
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
