import client from '../db/scylla.js';
import { types } from 'cassandra-driver';

export type CreateMessageInput = {
	channelId: string;
	messageId: string;
	userId: string;
	content?: string;
	ciphertext?: string | null;
	iv?: string | null;
	type?: string;
	replyTo?: string | null;
	replyToContent?: string | null
};

export type Message = {
	channel_id: string;
	message_id: string;
	user_id: string;
	content: string;
	ciphertext?: string | null;
	iv?: string | null;
	type: string;
	created_at: Date;
	updated_at: Date | null;
	reply_to?: string | null;
	reply_to_content?: string | null;
};

export type MessagePage = {
	messages: Message[];
	nextCursor: string | null;
	hasMore: boolean;
};

export type ReactionCount = {
	emoji_id: string;
	count: number;
};

function normalizeCounterValue(value: unknown): number | null {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}

	if (typeof value === 'bigint') {
		return Number(value);
	}

	if (typeof value === 'string') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}

	if (value && typeof value === 'object' && 'toNumber' in value) {
		const maybeCounter = value as { toNumber?: () => number };
		if (typeof maybeCounter.toNumber === 'function') {
			const parsed = maybeCounter.toNumber();
			return Number.isFinite(parsed) ? parsed : null;
		}
	}

	return null;
}

function wasApplied(result: { first: () => Record<string, unknown> | null }): boolean {
	const firstRow = result.first();
	if (!firstRow) {
		return false;
	}

	const applied = firstRow['[applied]'];
	return applied === true;
}

const messageModel = {
	async createMessage(messageData: CreateMessageInput): Promise<void> {
		const query = `
			INSERT INTO liscord.messages_by_channel (
				channel_id,
				message_id,
				user_id,
				ciphertext,
				iv,
				content,
				type,
				created_at,
				updated_at,
				reply_to,
				reply_to_content
			) VALUES (?, ?, ?, ?, ?, ?, ?, toTimestamp(now()), null, ?, ?)
		`;

		const params = [
			types.Uuid.fromString(messageData.channelId),
			types.Uuid.fromString(messageData.messageId),
			types.Uuid.fromString(messageData.userId),
			messageData.ciphertext ?? null,
			messageData.iv ?? null,
			messageData.content ?? '',
			messageData.type ?? 'text',
			messageData.replyTo ? types.Uuid.fromString(messageData.replyTo) : null,
			messageData.replyToContent ?? null,
		];

		await client.execute(query, params, { prepare: true });
	},

	async getMessagesByChannelId(channelId: string, limit: number = 50, cursor?: string): Promise<MessagePage> {
		const query = `
			SELECT
				channel_id,
				message_id,
				user_id,
				ciphertext,
				iv,
				content,
				type,
				created_at,
				updated_at,
				reply_to,
				reply_to_content
			FROM liscord.messages_by_channel
			WHERE channel_id = ?
		`;

		const params = [types.Uuid.fromString(channelId)];
		const pageState = cursor ? Buffer.from(cursor, 'base64').toString('utf8') : undefined;
		const queryOptions: { prepare: true; fetchSize: number; pageState?: string } = {
			prepare: true,
			fetchSize: limit,
		};

		if (pageState) {
			queryOptions.pageState = pageState;
		}

		const result = await client.execute(query, params, queryOptions);

		const messages = result.rows.map((row) => ({
			channel_id: row.channel_id.toString(),
			message_id: row.message_id.toString(),
			user_id: row.user_id.toString(),
			ciphertext: row.ciphertext ?? null,
			iv: row.iv ?? null,
			// user_name: userIdToUsernameMap[row.user_id.toString()] || 'Unknown User',
			content: row.content,
			type: row.type,
			created_at: row.created_at,
			updated_at: row.updated_at,
			reply_to: row.reply_to ? row.reply_to.toString() : null,
			reply_to_content: row.reply_to_content ? row.reply_to_content.toString() : null,
			// reply_to_content: row.reply_to_content.toString() || null,
		}));

		const nextCursor = result.pageState
			? Buffer.from(result.pageState, 'utf8').toString('base64')
			: null;

		return {
			messages,
			nextCursor,
			hasMore: Boolean(result.pageState),
		};
	},

	async addReaction(messageId: string, emojiId: string, userId: string): Promise<boolean> {
		const insertReactionQuery = `
			INSERT INTO liscord.reactions_by_message (message_id, emoji_id, user_id, created_at)
			VALUES (?, ?, ?, toTimestamp(now()))
			IF NOT EXISTS
		`;

		const insertReactionResult = await client.execute(
			insertReactionQuery,
			[
				types.Uuid.fromString(messageId),
				emojiId,
				types.Uuid.fromString(userId),
			],
			{ prepare: true }
		);

		if (!wasApplied(insertReactionResult)) {
			return false;
		}

		await client.execute(
			`UPDATE liscord.reaction_counts
			 SET count = count + 1
			 WHERE message_id = ? AND emoji_id = ?`,
			[types.Uuid.fromString(messageId), emojiId],
			{ prepare: true }
		);

		await client.execute(
			`INSERT INTO liscord.reactions_by_user (user_id, message_id, emoji_id, created_at)
			 VALUES (?, ?, ?, toTimestamp(now()))`,
			[
				types.Uuid.fromString(userId),
				types.Uuid.fromString(messageId),
				emojiId,
			],
			{ prepare: true }
		);

		return true;
	},

	async removeReaction(messageId: string, emojiId: string, userId: string): Promise<boolean> {
		const deleteReactionQuery = `
			DELETE FROM liscord.reactions_by_message
			WHERE message_id = ? AND emoji_id = ? AND user_id = ?
			IF EXISTS
		`;

		const deleteReactionResult = await client.execute(
			deleteReactionQuery,
			[
				types.Uuid.fromString(messageId),
				emojiId,
				types.Uuid.fromString(userId),
			],
			{ prepare: true }
		);

		if (!wasApplied(deleteReactionResult)) {
			return false;
		}

		await client.execute(
			`UPDATE liscord.reaction_counts
			 SET count = count - 1
			 WHERE message_id = ? AND emoji_id = ?`,
			[types.Uuid.fromString(messageId), emojiId],
			{ prepare: true }
		);

		await client.execute(
			`DELETE FROM liscord.reactions_by_user
			 WHERE user_id = ? AND message_id = ? AND emoji_id = ?`,
			[
				types.Uuid.fromString(userId),
				types.Uuid.fromString(messageId),
				emojiId,
			],
			{ prepare: true }
		);

		return true;
	},

	async getReactionCounts(messageId: string): Promise<ReactionCount[]> {
		const result = await client.execute(
			`SELECT emoji_id, count
			 FROM liscord.reaction_counts
			 WHERE message_id = ?`,
			[types.Uuid.fromString(messageId)],
			{ prepare: true }
		);

		return result.rows
			.map((row) => {
				const normalizedCount = normalizeCounterValue(row.count);
				if (!normalizedCount || normalizedCount <= 0) {
					return null;
				}

				return {
					emoji_id: row.emoji_id as string,
					count: normalizedCount,
				};
			})
			.filter((row): row is ReactionCount => row !== null);
	},

	async getUserReactedEmojiIds(messageId: string, userId: string): Promise<string[]> {
		const result = await client.execute(
			`SELECT emoji_id
			 FROM liscord.reactions_by_message
			 WHERE message_id = ?`,
			[types.Uuid.fromString(messageId)],
			{ prepare: true }
		);

		const normalizedUserId = userId.toLowerCase();
		return result.rows
			.filter((row) => row.user_id?.toString().toLowerCase() === normalizedUserId)
			.map((row) => row.emoji_id as string);
	},
};

export default messageModel;
