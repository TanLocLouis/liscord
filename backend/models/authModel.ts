import pool from '../db/db.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

type CreateUserInput = {
    user_id: string;
    username: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
};

type UserRow = RowDataPacket & {
    user_id: string;
    username: string;
    email: string;
    password_hash: string;
    is_active: 0 | 1;
};

const authModel = {
    async createUser(userData: CreateUserInput): Promise<ResultSetHeader> {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (user_id, username, email, password_hash, created_at, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [userData.user_id, userData.username, userData.email, userData.passwordHash, new Date(), false]
        );
        return result;
    },
    async isUserExisted(username: string): Promise<boolean> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT 1 FROM users WHERE username = ? LIMIT 1',
            [username]
        );
        return rows.length > 0;
    },
    async setActive(username: string): Promise<ResultSetHeader> {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE users SET is_active = ? WHERE username = ?',
            [true, username]
        );
        return result;
    },
    async getUserByUsername(username: string): Promise<UserRow | null> {
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT * FROM users WHERE username = ? LIMIT 1',
            [username]
        );
        return rows[0] || null;
    },
    async getUserByEmail(email: string): Promise<UserRow | null> {
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT * FROM users WHERE email = ? LIMIT 1',
            [email]
        );
        return rows[0] || null;
    },
    async updatePassword(username: string, newPasswordHash: string): Promise<ResultSetHeader> {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE users SET password_hash = ? WHERE username = ?',
            [newPasswordHash, username]
        );
        return result;
    }
}

export default authModel;