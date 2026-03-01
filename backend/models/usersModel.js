import pool from '../db/db.js';

const usersModel = {
    async getUserProfile(userId) {
        const [rows] = await pool.execute(
            'SELECT username, email, created_at, is_active FROM users WHERE username = ? LIMIT 1',
            [userId]
        );
        return rows[0] || null;
    },
    async getUserPassword(userId) {
        const [rows] = await pool.execute(
            'SELECT password_hash FROM users WHERE username = ? LIMIT 1',
            [userId]
        );
        return rows[0]?.password_hash || null;
    },
    async updateUserPassword(userId, newPasswordHash) {
        // console.log('[DEBUG] usersModel.updateUserPassword called with: ', userId, newPasswordHash);
        const [result] = await pool.execute(
            'UPDATE users SET password_hash = ? WHERE username = ?',
            [newPasswordHash, userId]
        );
        return result.affectedRows > 0;
    }
}

export default usersModel;