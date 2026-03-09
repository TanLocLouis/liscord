import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import messageServices from '../services/messageServices.js';

type CreateMessageBody = {
	channelId: string;
	content: string;
	type?: string;
	replyTo?: string;
};

const createMessage = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const body = req.body as Partial<CreateMessageBody>;
	if (!body.channelId || !body.content) {
		throw new AppError('No data provided', 400, 'NO_DATA_PROVIDED');
	}

	const payload = {
		channelId: body.channelId,
		content: body.content,
		...(body.type !== undefined ? { type: body.type } : {}),
		...(body.replyTo !== undefined ? { replyTo: body.replyTo } : {}),
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

	const result = await messageServices.getChannelMessages(req.user.user_id, channelId, limit);
	res.status(200).json(result);
});

export default {
	createMessage,
	getChannelMessages,
};
