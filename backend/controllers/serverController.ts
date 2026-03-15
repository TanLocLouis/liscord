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
	// Validate user authentication
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

const getServerDetails = asyncHandler(async (req, res) => {
	// Validate user authentication
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const { serverId } = req.params;
	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Invalid server ID', 400, 'INVALID_SERVER_ID');
	}

	const result = await serverServices.getServerDetails(serverId, req.user.user_id);

	res.status(200).json(result);
});

const getJoinedServers = asyncHandler(async (req, res) => {
	//  Validate user authentication
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const result = await serverServices.getJoinedServers(req.user.user_id);
	res.status(200).json(result);
});

const joinServer = asyncHandler(async (req, res) => {
	// Validate user authentication
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
	// Validate user authentication
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
	// Validate user authentication
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

const updateServerName = asyncHandler(async (req, res) => {
	// Validate user authentication
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	// Validate server ID
	const { serverId } = req.params;
	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Invalid server ID', 400, 'INVALID_SERVER_ID');
	}

	// Validate server name
	const { serverName } = req.body as { serverName?: string };
	if (!serverName || typeof serverName !== 'string' || serverName.length > 100) {
		throw new AppError('Invalid server name', 400, 'INVALID_SERVER_NAME');
	}
	await serverServices.updateServerName(serverId, req.user.user_id, serverName);

	res.status(200).json({ message: 'Server name updated successfully' });
});

const updateServerIcon = asyncHandler(async (req, res) => {
	// Validate user authentication
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	// Validate server ID
	const { serverId } = req.params;
	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Invalid server ID', 400, 'INVALID_SERVER_ID');
	}

	// Validate that a file was uploaded
	if (!req.file) {
		throw new AppError('No avatar file uploaded', 400, 'NO_AVATAR_UPLOADED');
	}

	await serverServices.updateServerIcon(serverId, req.user.user_id, req.file);

	res.status(200).json({ message: 'Server icon updated successfully' });
});

export default {
	createServer,
	getServerDetails,
	getJoinedServers,
	joinServer,
	createInvite,
	joinServerByInvite,
	updateServerName,
	updateServerIcon,
};
