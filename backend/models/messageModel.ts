import client from '../db/scylla.js';
import { types } from 'cassandra-driver';
import usersModel from './usersModel.js';

export type CreateMessageInput = {
	channelId: string;
	messageId: string;
	userId: string;
	content: string;
	type?: string;
	replyTo?: string;
};

export type Message = {
	channel_id: string;
	message_id: string;
	user_id: string;
	content: string;
	type: string;
	created_at: Date;
	updated_at: Date | null;
	reply_to: string | null;
};

const messageModel = {
	async createMessage(messageData: CreateMessageInput): Promise<void> {
		const query = `
			INSERT INTO liscord.messages_by_channel (
				channel_id,
				message_id,
				user_id,
				content,
				type,
				created_at,
				updated_at,
				reply_to
			) VALUES (?, ?, ?, ?, ?, toTimestamp(now()), null, ?)
		`;

		const params = [
			types.Uuid.fromString(messageData.channelId),
			types.Uuid.fromString(messageData.messageId),
			types.Uuid.fromString(messageData.userId),
			messageData.content,
			messageData.type ?? 'text',
			messageData.replyTo ? types.Uuid.fromString(messageData.replyTo) : null,
		];

		await client.execute(query, params, { prepare: true });
	},

	async getMessagesByChannelId(channelId: string, limit: number = 50): Promise<Message[]> {
		const query = `
			SELECT
				channel_id,
				message_id,
				user_id,
				content,
				type,
				created_at,
				updated_at,
				reply_to
			FROM liscord.messages_by_channel
			WHERE channel_id = ?
			LIMIT ?
		`;

		const params = [types.Uuid.fromString(channelId), limit];

		const result = await client.execute(query, params, { prepare: true });

		// find usernames for each message
		const userIds = Array.from(new Set(result.rows.map(row => row.user_id.toString())));
		const userIdToUsernameMap: Record<string, string> = {};

		for (const userId of userIds) {
			const username = await usersModel.getUserNameByUserId(userId);
			console.log(`[DEBUG] Fetched username for userId ${userId}: ${username}`);
			if (username) {
				userIdToUsernameMap[userId] = username;
			}
		}

		return result.rows.map((row) => ({
			channel_id: row.channel_id.toString(),
			message_id: row.message_id.toString(),
			user_id: row.user_id.toString(),
			user_name: userIdToUsernameMap[row.user_id.toString()] || 'Unknown User',
			content: row.content,
			type: row.type,
			created_at: row.created_at,
			updated_at: row.updated_at,
			reply_to: row.reply_to ? row.reply_to.toString() : null,
		}));
	},
};

export default messageModel;
