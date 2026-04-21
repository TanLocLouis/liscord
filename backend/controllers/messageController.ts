import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import messageServices from '../services/messageServices.js';

type CreateMessageBody = {
	channelId: string;
	content?: string;
	ciphertext?: string;
	iv?: string;
	type?: string;
	replyTo?: string;
	replyToContent?: string;
};

const createMessage = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const body = req.body as Partial<CreateMessageBody>;
	if (!body.channelId || (!body.content && !body.ciphertext)) {
		throw new AppError('No data provided', 400, 'NO_DATA_PROVIDED');
	}

	const payload = {
		channelId: body.channelId,
		...(typeof body.content === 'string' ? { content: body.content } : {}),
		...(typeof body.ciphertext === 'string' ? { ciphertext: body.ciphertext } : {}),
		...(typeof body.iv === 'string' ? { iv: body.iv } : {}),
		...(body.type !== undefined ? { type: body.type } : {}),
		replyTo: typeof body.replyTo === 'string' && body.replyTo.trim() ? body.replyTo.trim() : null,
		replyToContent: typeof body.replyToContent === 'string' && body.replyToContent.trim() ? body.replyToContent.trim() : null,
	};

	const result = await messageServices.createMessage(req.user.user_id, payload);
	res.status(201).json(result);
});

const getChannelMessages = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const channelId = req.params.channelId;
	if (!channelId || typeof channelId !== 'string') {
		throw new AppError('Channel id is required', 400, 'INVALID_CHANNEL_ID');
	}

	const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
	const cursor = typeof req.query.cursor === 'string' && req.query.cursor.trim().length > 0
		? req.query.cursor.trim()
		: undefined;

	const result = await messageServices.getChannelMessages(req.user.user_id, channelId, limit, cursor);
	res.status(200).json(result);
});

const addReaction = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const { messageId } = req.params;
	if (!messageId || typeof messageId !== 'string') {
		throw new AppError('Message id is required', 400, 'INVALID_MESSAGE_ID');
	}

	const { channelId, emojiId } = req.body as { channelId?: string; emojiId?: string };
	if (!channelId || !emojiId) {
		throw new AppError('Channel id and emoji id are required', 400, 'INVALID_REACTION_INPUT');
	}

	const result = await messageServices.addReaction(req.user.user_id, {
		messageId,
		channelId,
		emojiId,
	});

	res.status(200).json(result);
});

const removeReaction = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const { messageId, emojiId } = req.params;
	if (!messageId || typeof messageId !== 'string' || !emojiId || typeof emojiId !== 'string') {
		throw new AppError('Message id and emoji id are required', 400, 'INVALID_REACTION_INPUT');
	}

	const { channelId } = req.body as { channelId?: string };
	if (!channelId) {
		throw new AppError('Channel id is required', 400, 'INVALID_CHANNEL_ID');
	}

	const result = await messageServices.removeReaction(req.user.user_id, {
		messageId,
		channelId,
		emojiId,
	});

	res.status(200).json(result);
});

const getMessageReactions = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const { messageId } = req.params;
	if (!messageId || typeof messageId !== 'string') {
		throw new AppError('Message id is required', 400, 'INVALID_MESSAGE_ID');
	}

	const channelId = req.query.channelId;
	if (!channelId || typeof channelId !== 'string') {
		throw new AppError('Channel id is required', 400, 'INVALID_CHANNEL_ID');
	}

	const result = await messageServices.getMessageReactions(req.user.user_id, messageId, channelId);
	res.status(200).json(result);
});

export default {
	createMessage,
	getChannelMessages,
	addReaction,
	removeReaction,
	getMessageReactions,
};
