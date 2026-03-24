import { randomUUID } from 'node:crypto';
import AppError from '../utils/AppError.js';
import messageModel from '../models/messageModel.js';
import channelModel from '../models/channelModel.js';
import usersModel from '../models/usersModel.js';
import emojiServices from './emojiServices.js';

type CreateMessagePayload = {
	channelId: string;
	content: string;
	type?: string;
	replyTo?: string | null;
	replyToContent?: string | null;
};

function assertUuid(input: string, errorCode: string, message: string) {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(input)) {
		throw new AppError(message, 400, errorCode);
	}
}

async function assertChannelAccess(userId: string, channelId: string) {
	const channel = await channelModel.getChannelById(channelId);
	if (!channel) {
		throw new AppError('Channel not found', 404, 'CHANNEL_NOT_FOUND');
	}

	const isMember = await channelModel.isServerMember(channel.server_id, userId);
	if (!isMember) {
		throw new AppError('Forbidden', 403, 'FORBIDDEN');
	}

	return channel;
}

async function createMessage(userId: string, payload: CreateMessagePayload) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedChannelId = payload.channelId.trim();
	const normalizedContent = payload.content.trim();

	if (!normalizedChannelId) {
		throw new AppError('Channel id is required', 400, 'INVALID_CHANNEL_ID');
	}

	if (!normalizedContent) {
		throw new AppError('Message content is required', 400, 'INVALID_CONTENT');
	}

	assertUuid(normalizedChannelId, 'INVALID_CHANNEL_ID', 'Invalid channel id format');
	await assertChannelAccess(userId, normalizedChannelId);

	const messageId = randomUUID();

	const messageData: any = {
		channelId: normalizedChannelId,
		messageId,
		userId,
		content: normalizedContent,
		type: payload.type ?? 'text',
	};

	if (payload.replyTo) {
		messageData.replyTo = payload.replyTo;
		messageData.replyToContent = payload.replyToContent;
	}

	await messageModel.createMessage(messageData);

	return {
		messageId,
		message: 'Message created successfully',
	};
}

async function getChannelMessages(userId: string, channelId: string, limit?: number) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedChannelId = channelId.trim();
	if (!normalizedChannelId) {
		throw new AppError('Channel id is required', 400, 'INVALID_CHANNEL_ID');
	}

	assertUuid(normalizedChannelId, 'INVALID_CHANNEL_ID', 'Invalid channel id format');
	await assertChannelAccess(userId, normalizedChannelId);

	const messageLimit = limit && limit > 0 && limit <= 100 ? limit : 50;
	const messages = await messageModel.getMessagesByChannelId(normalizedChannelId, messageLimit);

	// find usernames for each message
	const userIds = Array.from(new Set(messages.map(msg => msg.user_id)));
	const userIdToUsernameMap: Record<string, string> = {};
	const userIdToAvatarMap: Record<string, string> = {};

	for (const userId of userIds) {
		const username = await usersModel.getUserNameByUserId(userId);
		const avatar = await usersModel.getUserAvatarByUserId(userId);
		if (username) {
			userIdToUsernameMap[userId] = username;
		}
		if (avatar) {
			userIdToAvatarMap[userId] = avatar;
		}
	}


	const enrichedMessages = await Promise.all(messages.map(async (msg) => {
		const reactionCounts = await messageModel.getReactionCounts(msg.message_id);
		const userReactedEmojiIds = new Set(await messageModel.getUserReactedEmojiIds(msg.message_id, userId));
		const emojiIds = reactionCounts.map((row) => row.emoji_id);
		const emojiMap = await emojiServices.getEmojiMapByIds(emojiIds);

		const reactions = reactionCounts.map((row) => {
			const emojiMetadata = emojiMap.get(row.emoji_id);
			return {
				emojiId: row.emoji_id,
				emojiName: emojiMetadata?.name || null,
				emojiUrl: emojiMetadata?.imageUrl || null,
				emojiUnicode: emojiMetadata?.unicode || null,
				count: row.count,
				reactedByMe: userReactedEmojiIds.has(row.emoji_id),
			};
		});

		return {
			...msg,
			user_name: userIdToUsernameMap[msg.user_id] || 'Unknown User',
			avatar: userIdToAvatarMap[msg.user_id] || null,
			reactions,
		};
	}));

	return {
		messages: enrichedMessages,
	};
}

async function addReaction(userId: string, payload: { messageId: string; channelId: string; emojiId: string }) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const messageId = payload.messageId.trim();
	const channelId = payload.channelId.trim();
	const emojiId = payload.emojiId.trim();

	if (!messageId || !channelId || !emojiId) {
		throw new AppError('Message id, channel id, and emoji id are required', 400, 'INVALID_REACTION_INPUT');
	}

	assertUuid(messageId, 'INVALID_MESSAGE_ID', 'Invalid message id format');
	assertUuid(channelId, 'INVALID_CHANNEL_ID', 'Invalid channel id format');
	assertUuid(emojiId, 'INVALID_EMOJI_ID', 'Invalid emoji id format');

	const channel = await assertChannelAccess(userId, channelId);
	await emojiServices.validateServerEmoji(channel.server_id, emojiId);

	const created = await messageModel.addReaction(messageId, emojiId, userId);

	return {
		message: created ? 'Reaction added successfully' : 'Reaction already exists',
		created,
	};
}

async function removeReaction(userId: string, payload: { messageId: string; channelId: string; emojiId: string }) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const messageId = payload.messageId.trim();
	const channelId = payload.channelId.trim();
	const emojiId = payload.emojiId.trim();

	if (!messageId || !channelId || !emojiId) {
		throw new AppError('Message id, channel id, and emoji id are required', 400, 'INVALID_REACTION_INPUT');
	}

	assertUuid(messageId, 'INVALID_MESSAGE_ID', 'Invalid message id format');
	assertUuid(channelId, 'INVALID_CHANNEL_ID', 'Invalid channel id format');
	assertUuid(emojiId, 'INVALID_EMOJI_ID', 'Invalid emoji id format');

	const channel = await assertChannelAccess(userId, channelId);
	await emojiServices.validateServerEmoji(channel.server_id, emojiId);

	const removed = await messageModel.removeReaction(messageId, emojiId, userId);

	return {
		message: removed ? 'Reaction removed successfully' : 'Reaction not found',
		removed,
	};
}

async function getMessageReactions(userId: string, messageId: string, channelId: string) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedMessageId = messageId.trim();
	const normalizedChannelId = channelId.trim();

	if (!normalizedMessageId || !normalizedChannelId) {
		throw new AppError('Message id and channel id are required', 400, 'INVALID_REACTION_INPUT');
	}

	assertUuid(normalizedMessageId, 'INVALID_MESSAGE_ID', 'Invalid message id format');
	assertUuid(normalizedChannelId, 'INVALID_CHANNEL_ID', 'Invalid channel id format');

	const channel = await assertChannelAccess(userId, normalizedChannelId);

	const reactionCounts = await messageModel.getReactionCounts(normalizedMessageId);
	const userReactedEmojiIds = new Set(await messageModel.getUserReactedEmojiIds(normalizedMessageId, userId));
	const emojiMap = await emojiServices.getEmojiMapByIds(reactionCounts.map((row) => row.emoji_id));

	return {
		serverId: channel.server_id,
		reactions: reactionCounts
			.filter((row) => emojiMap.has(row.emoji_id))
			.map((row) => {
				const emoji = emojiMap.get(row.emoji_id);
				return {
					emojiId: row.emoji_id,
					emojiName: emoji?.name || null,
					emojiUrl: emoji?.imageUrl || null,
					emojiUnicode: emoji?.unicode || null,
					count: row.count,
					reactedByMe: userReactedEmojiIds.has(row.emoji_id),
				};
			}),
	};
}

export default {
	createMessage,
	getChannelMessages,
	addReaction,
	removeReaction,
	getMessageReactions,
};
