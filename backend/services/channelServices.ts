import { randomUUID } from 'node:crypto';
import AppError from '../utils/AppError.js';
import channelModel from '../models/channelModel.js';

type CreateChannelPayload = {
	serverId: string;
	channelName: string;
	type?: 'text' | 'voice';
	position?: number;
};

async function createChannel(userId: string, payload: CreateChannelPayload) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedServerId = payload.serverId.trim();
	const normalizedChannelName = payload.channelName.trim();

	if (!normalizedServerId) {
		throw new AppError('Server id is required', 400, 'INVALID_SERVER_ID');
	}

	if (!normalizedChannelName) {
		throw new AppError('Channel name is required', 400, 'INVALID_CHANNEL_NAME');
	}

	const isMember = await channelModel.isServerMember(normalizedServerId, userId);
	if (!isMember) {
		throw new AppError('Forbidden', 403, 'FORBIDDEN');
	}

	const channelId = randomUUID();
	const position = payload.position ?? (await channelModel.getNextPosition(normalizedServerId));

	await channelModel.createChannel({
		channelId,
		channelName: normalizedChannelName,
		type: payload.type ?? 'text',
		position,
		serverId: normalizedServerId,
	});

	return {
		channelId,
		message: 'Channel created successfully',
	};
}

async function getServerChannels(userId: string, serverId: string) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedServerId = serverId.trim();
	if (!normalizedServerId) {
		throw new AppError('Server id is required', 400, 'INVALID_SERVER_ID');
	}

	const isMember = await channelModel.isServerMember(normalizedServerId, userId);
	if (!isMember) {
		throw new AppError('Forbidden', 403, 'FORBIDDEN');
	}

	const channels = await channelModel.getChannelsByServerId(normalizedServerId);

	return {
		channels,
	};
}

export default {
	createChannel,
	getServerChannels,
};
