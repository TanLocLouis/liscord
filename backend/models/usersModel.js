import pool from '../db/db.js';

const usersModel = {
    async getUserProfile(userId) {
        const [rows] = await pool.execute(
            'SELECT username, email, createdAt, isActive FROM users WHERE username = ? LIMIT 1',
            [userId]
        );
        return rows[0] || null;
    },
    async getUserPassword(userId) {
        const [rows] = await pool.execute(
            'SELECT passwordHash FROM users WHERE username = ? LIMIT 1',
            [userId]
        );
        return rows[0]?.passwordHash || null;
    },
    async updateUserPassword(userId, newPasswordHash) {
        // console.log('[DEBUG] usersModel.updateUserPassword called with: ', userId, newPasswordHash);
        const [result] = await pool.execute(
            'UPDATE users SET passwordHash = ? WHERE username = ?',
            [newPasswordHash, userId]
        );
        return result.affectedRows > 0;
    }
}

export default usersModel;