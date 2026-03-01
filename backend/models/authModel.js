import pool from '../db/db.js';

const authModel = {
    async createUser(userData) {
        const [result] = await pool.execute(
            'INSERT INTO users (user_id, username, email, password_hash, created_at, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [userData.user_id, userData.username, userData.email, userData.passwordHash, new Date(), false]
        );
        return result;
    },
    async isUserExisted(username) {
        const [rows] = await pool.execute(
            'SELECT 1 FROM users WHERE username = ? LIMIT 1',
            [username]
        );
        return rows.length > 0;
    },
    async setActive(username) {
        const [result] = await pool.execute(
            'UPDATE users SET is_active = ? WHERE username = ?',
            [true, username]
        );
        return result;
    },
    async getUserByUsername(username) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ? LIMIT 1',
            [username]
        );
        return rows[0] || null;
    },
    async getUserByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ? LIMIT 1',
            [email]
        );
        return rows[0] || null;
    },
    async updatePassword(username, newPasswordHash) {
        const [result] = await pool.execute(
            'UPDATE users SET password_hash = ? WHERE username = ?',
            [newPasswordHash, username]
        );
        return result;
    }
}

export default authModel;