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

async function renameChannel(userId: string, channelId: string, newName: string) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedChannelId = channelId.trim();
	const normalizedNewName = newName.trim();

	if (!normalizedChannelId) {
		throw new AppError('Channel id is required', 400, 'INVALID_CHANNEL_ID');
	}

	if (!normalizedNewName) {
		throw new AppError('New channel name is required', 400, 'INVALID_NEW_CHANNEL_NAME');
	}

	const channel = await channelModel.getChannelById(normalizedChannelId);

	if (!channel) {
		throw new AppError('Channel not found', 404, 'CHANNEL_NOT_FOUND');
	}

	const isServerOwner = await serverModel.isServerOwner(channel.server_id, userId);
	if (!isServerOwner) {
		throw new AppError('Forbidden', 403, 'FORBIDDEN');
	}

	await channelModel.renameChannel(normalizedChannelId, normalizedNewName);

	return {
		message: 'Channel renamed successfully',
	};
}

async function deleteChannel(userId: string, channelId: string) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedChannelId = channelId.trim();
	if (!normalizedChannelId) {
		throw new AppError('Channel id is required', 400, 'INVALID_CHANNEL_ID');
	}

	const channel = await channelModel.getChannelById(normalizedChannelId);

	if (!channel) {
		throw new AppError('Channel not found', 404, 'CHANNEL_NOT_FOUND');
	}

	const isServerOwner = await serverModel.isServerOwner(channel.server_id, userId);
	if (!isServerOwner) {
		throw new AppError('Forbidden', 403, 'FORBIDDEN');
	}

	await channelModel.deleteChannel(normalizedChannelId);

	return {
		message: 'Channel deleted successfully',
	};
}

export default {
	createChannel,
	getServerChannels,
	renameChannel,
	deleteChannel,
};
