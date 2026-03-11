import { randomUUID } from 'node:crypto';
import AppError from '../utils/AppError.js';
import channelModel from '../models/channelModel.js';
import serverModel from '../models/serverModel.js';

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

	// Check does user own the server
	const isServerOwner = await serverModel.isServerOwner(normalizedServerId, userId);
	if (!isServerOwner) {
		throw new AppError('Forbidden', 403, 'FORBIDDEN');
	}

	// Check the number of channel per channel the user has created
	// Set the limit in MAX_SERVERS_PER_USER environment variable
	const MAX_CHANNELS_PER_SERVER = parseInt(process.env.MAX_CHANNELS_PER_SERVER || '10', 10);
	const userServersCount = await channelModel.getChannelsPerServerCount(normalizedServerId);
	if (userServersCount >= MAX_CHANNELS_PER_SERVER) {
		throw new AppError(`You have reached the maximum limit of ${MAX_CHANNELS_PER_SERVER} channels`, 400, 'CHANNEL_LIMIT_REACHED');
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
