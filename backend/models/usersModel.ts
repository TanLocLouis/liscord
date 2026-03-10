import pool from '../db/db.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

type UserProfileRow = RowDataPacket & {
    username: string;
    email: string;
    created_at: Date;
    is_active: 0 | 1;
};

type UserPasswordRow = RowDataPacket & {
    password_hash: string;
};

const usersModel = {
    async getUserProfile(userId: string): Promise<UserProfileRow | null> {
        const [rows] = await pool.execute<UserProfileRow[]>(
            'SELECT username, email, avatar, created_at, is_active FROM users WHERE username = ? LIMIT 1',
            [userId]
        );
        return rows[0] || null;
    },
    async getUserPassword(userId: string): Promise<string | null> {
        const [rows] = await pool.execute<UserPasswordRow[]>(
            'SELECT password_hash FROM users WHERE username = ? LIMIT 1',
            [userId]
        );
        return rows[0]?.password_hash || null;
    },
    async updateUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
        // console.log('[DEBUG] usersModel.updateUserPassword called with: ', userId, newPasswordHash);
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE users SET password_hash = ? WHERE username = ?',
            [newPasswordHash, userId]
        );
        return result.affectedRows > 0;
    },
    async getUserNameByUserId(userId: string): Promise<string | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT username FROM users WHERE user_id = ? LIMIT 1',
            [userId]
        );
        return rows[0]?.username || null;
    },
    async getUserAvatarByUserId(userId: string): Promise<string | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT avatar FROM users WHERE user_id = ? LIMIT 1',
            [userId]
        );
        return rows[0]?.avatar || null;
    },
    async updateUserAvatar(userId: string, avatarUrl: string): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE users SET avatar = ? WHERE username = ?',
            [avatarUrl, userId]
        );
        return result.affectedRows > 0;
    }
}

export default usersModel;