import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import channelServices from '../services/channelServices.js';

type CreateChannelBody = {
	serverId: string;
	channelName: string;
	type?: 'text' | 'voice';
	position?: number;
};

const createChannel = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const body = req.body as Partial<CreateChannelBody>;
	if (!body.serverId || !body.channelName) {
		throw new AppError('No data provided', 400, 'NO_DATA_PROVIDED');
	}

	const payload = {
		serverId: body.serverId,
		channelName: body.channelName,
		...(body.type !== undefined ? { type: body.type } : {}),
		...(body.position !== undefined ? { position: body.position } : {}),
	};

	const result = await channelServices.createChannel(req.user.user_id, payload);
	res.status(201).json(result);
});

const getServerChannels = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const serverId = req.params.serverId;
	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Server id is required', 400, 'INVALID_SERVER_ID');
	}

	const result = await channelServices.getServerChannels(req.user.user_id, serverId);
	res.status(200).json(result);
});

export default {
	createChannel,
	getServerChannels,
};
