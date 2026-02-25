import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Hash a plain password
 * @param {string} plainPassword - The password to hash
 * @returns {Promise<string>} - The hashed password
 */
async function hashPassword(plainPassword) {
  const saltRounds = 10;
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  return hashed;
}

async function genToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Compare a plain password with a hashed password
 * @param {string} plainPassword - The plain password to check
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Middleware for password authentication during bin retrieval
 * Validates password if bin is password-protected
 * Attaches isAuthenticated flag to req object
 */
function authenticatePassword(req, res, next) {
  // This middleware is called after bin is retrieved from DB
  // Expected: req.bin (the bin document), req.query.password (user input)
  
  const bin = req.bin;
  const passwordProvided = req.query && req.query.password;

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
  bcrypt.compare(passwordProvided, bin.password, (err, result) => {
    if (err) {
      console.error('[ERROR] Password comparison error', err);
      return res.status(401).json({ message: 'Authentication failed' });
    }

    if (result) {
      req.isAuthenticated = true;
      // console.log('[STATUS] Password authentication successful');
      return next();
    } else {
      // console.log('[STATUS] Invalid password provided');
      return res.status(401).json({ message: 'Invalid password' });
    }
  });
}

export default {
  hashPassword,
  comparePassword,
  authenticatePassword,
  genToken
}