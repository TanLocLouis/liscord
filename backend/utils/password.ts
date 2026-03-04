import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { RequestHandler } from 'express';

/**
 * Hash a plain password
 * @param {string} plainPassword - The password to hash
 * @returns {Promise<string>} - The hashed password
 */
async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 10;
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  return hashed;
}

async function genToken(): Promise<string> {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Compare a plain password with a hashed password
 * @param {string} plainPassword - The plain password to check
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Middleware for password authentication during bin retrieval
 * Validates password if bin is password-protected
 * Attaches isAuthenticated flag to req object
 */
const authenticatePassword: RequestHandler = async (req, res, next) => {
  // This middleware is called after bin is retrieved from DB
  // Expected: req.bin (the bin document), req.query.password (user input)
  
  const bin = req.bin;
  const passwordProvided = req.query && req.query.password;

  if (!bin) {
    return res.status(404).json({ message: 'Bin not found' });
  }

  // If bin has no password, it's public
  if (!bin.password || bin.password === '') {
    req.isAuthenticated = true;
    return next();
  }

  // Bin requires password
  if (!passwordProvided) {
    // console.log('[STATUS] Bin requires password but none provided');
    return res.status(401).json({ message: 'Password required' });
  }

  // Compare passwords
  if (typeof passwordProvided !== 'string') {
    return res.status(401).json({ message: 'Invalid password' });
  }

  try {
    const result = await bcrypt.compare(passwordProvided, bin.password);

    if (result) {
      req.isAuthenticated = true;
      return next();
    }

    return res.status(401).json({ message: 'Invalid password' });
  } catch (err) {
    console.error('[ERROR] Password comparison error', err);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

export default {
  hashPassword,
  comparePassword,
  authenticatePassword,
  genToken
}