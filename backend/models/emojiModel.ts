import { randomUUID } from 'node:crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../db/db.js';

export type EmojiRow = RowDataPacket & {
	emoji_id: string;
	name: string;
	unicode: string | null;
	image_url: string | null;
	is_custom: 0 | 1;
	created_by: string | null;
	server_id: string | null;
	created_at: Date | null;
};

const emojiModel = {
	async createEmoji(payload: {
		emojiId?: string;
		name: string;
		unicode?: string | null;
		imageUrl?: string | null;
		isCustom: boolean;
		createdBy?: string | null;
		serverId?: string | null;
	}): Promise<string> {
		const emojiId = payload.emojiId ?? randomUUID();
		await pool.execute<ResultSetHeader>(
			`INSERT INTO emojis (
				emoji_id,
				name,
				\`unicode\`,
				image_url,
				is_custom,
				created_by,
				server_id
			) VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				emojiId,
				payload.name,
				payload.unicode ?? null,
				payload.imageUrl ?? null,
				payload.isCustom ? 1 : 0,
				payload.createdBy ?? null,
				payload.serverId ?? null,
			]
		);

		return emojiId;
	},

	async getServerEmojiByName(serverId: string, emojiName: string): Promise<EmojiRow | null> {
		const [rows] = await pool.execute<EmojiRow[]>(
			`SELECT emoji_id, name, \`unicode\`, image_url, is_custom, created_by, server_id, created_at
			 FROM emojis
			 WHERE server_id = ? AND name = ?
			 LIMIT 1`,
			[serverId, emojiName]
		);

		return rows[0] ?? null;
	},

	async getServerEmojis(serverId: string): Promise<EmojiRow[]> {
		const [rows] = await pool.execute<EmojiRow[]>(
			`SELECT emoji_id, name, \`unicode\`, image_url, is_custom, created_by, server_id, created_at
			 FROM emojis
			 WHERE server_id = ?
			 ORDER BY is_custom DESC, created_at ASC`,
			[serverId]
		);

		return rows;
	},

	async getServerEmojiById(serverId: string, emojiId: string): Promise<EmojiRow | null> {
		const [rows] = await pool.execute<EmojiRow[]>(
			`SELECT emoji_id, name, \`unicode\`, image_url, is_custom, created_by, server_id, created_at
			 FROM emojis
			 WHERE server_id = ? AND emoji_id = ?
			 LIMIT 1`,
			[serverId, emojiId]
		);

		return rows[0] ?? null;
	},

	async getEmojisByIds(emojiIds: string[]): Promise<EmojiRow[]> {
		if (emojiIds.length === 0) {
			return [];
		}

		const placeholders = emojiIds.map(() => '?').join(', ');
		const [rows] = await pool.execute<EmojiRow[]>(
			`SELECT emoji_id, name, \`unicode\`, image_url, is_custom, created_by, server_id, created_at
			 FROM emojis
			 WHERE emoji_id IN (${placeholders})`,
			emojiIds
		);

		return rows;
	},

	async deleteEmoji(emojiId: string): Promise<boolean> {
		const [result] = await pool.execute<ResultSetHeader>(
			`DELETE FROM emojis WHERE emoji_id = ?`,
			[emojiId]
		);

		return result.affectedRows > 0;
	},
};

export default emojiModel;
