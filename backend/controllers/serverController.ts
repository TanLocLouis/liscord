import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import serverServices from '../services/serverServices.js';
import channelServices from '../services/channelServices.js';

type CreateServerBody = {
	serverName: string;
	description?: string;
	serverIcon?: string;
};

type CreateInviteBody = {
	maxUses?: number;
	expiresInHours?: number;
};

const createServer = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const userId = req.user.user_id;

	const body = req.body as Partial<CreateServerBody>;
	if (!body.serverName) {
		throw new AppError('No data provided', 400, 'NO_DATA_PROVIDED');
	}

	const createPayload = {
		serverName: body.serverName,
		...(body.description !== undefined ? { description: body.description } : {}),
		...(body.serverIcon !== undefined ? { serverIcon: body.serverIcon } : {}),
	};
	
	// Create server
	const result = await serverServices.createServer(userId, createPayload);

	// Create default channels (general)
	await channelServices.createChannel(userId, {
		serverId: result.serverId,
		channelName: 'general',
		type: 'text',
		position: 0,
	});

	res.status(201).json(result);
});

const getJoinedServers = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const result = await serverServices.getJoinedServers(req.user.user_id);

	res.status(200).json(result);
});

const joinServer = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const userId = req.user.user_id;
	const { serverId } = req.params;

	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Invalid server ID', 400, 'INVALID_SERVER_ID');
	}

	try {
		await serverServices.joinServer(serverId, userId);
	} catch (error) {
		console.error('Error joining server:', error);
		throw new AppError('Failed to join server', 500, 'JOIN_SERVER_FAILED');
	}

	res.status(200).json({ message: 'Joined server successfully' });
});

const createInvite = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const { serverId } = req.params;
	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Invalid server ID', 400, 'INVALID_SERVER_ID');
	}

	const body = req.body as Partial<CreateInviteBody>;
	const result = await serverServices.createInvite(serverId, req.user.user_id, {
		...(body.maxUses !== undefined ? { maxUses: body.maxUses } : {}),
		...(body.expiresInHours !== undefined ? { expiresInHours: body.expiresInHours } : {}),
	});

	res.status(201).json(result);
});

const joinServerByInvite = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const { code } = req.params;
	if (!code || typeof code !== 'string') {
		throw new AppError('Invalid invite code', 400, 'INVALID_INVITE_CODE');
	}

	const result = await serverServices.joinServerByInvite(code, req.user.user_id);

	res.status(200).json(result);
});

export default {
	createServer,
	getJoinedServers,
	joinServer,
	createInvite,
	joinServerByInvite,
};
