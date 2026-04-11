import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import serverServices from '../services/serverServices.js';
import channelServices from '../services/channelServices.js';

type CreateServerBody = {
	serverName: string;
	description?: string;
	serverIcon?: string;
	type?: 'group' | 'dm';
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
		type: body.type ?? 'group',
	};

	// Create server
	const result = await serverServices.createServer(userId, createPayload);

	// Create default channel for group, or single channel for DM
	const channelName = body.type === 'dm' ? 'dm' : 'general';
	await channelServices.createChannel(userId, {
		serverId: result.serverId,
		channelName,
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

// Use for adding a member to a server (by server owner or by DM server creator)
const addServerMember = asyncHandler(async (req, res) => {
	// Validate user authentication
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	// Validate server ID
	const { serverId } = req.params;
	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Invalid server ID', 400, 'INVALID_SERVER_ID');
	}

	// Validate user ID in request body
	const { userId } = req.body as { userId?: string };
	if (!userId || typeof userId !== 'string') {
		throw new AppError('User ID is required', 400, 'MISSING_USER_ID');
	}

	await serverServices.addServerMember(serverId, userId, req.user.user_id);

	res.status(200).json({ message: 'Member added successfully' });
});

const getOrCreateDM = asyncHandler(async (req, res) => {
	// Validate user authentication
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	// Validate target user ID in request body
	const { targetUserId } = req.body as { targetUserId?: string };
	if (!targetUserId || typeof targetUserId !== 'string') {
		throw new AppError('Target user ID is required', 400, 'MISSING_TARGET_USER_ID');
	}

	const result = await serverServices.getOrCreateDM(req.user.user_id, targetUserId);

	res.status(200).json(result);
});

const leaveServer = asyncHandler(async (req, res) => {
	// Validate user authentication
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	// Validate server ID
	const { serverId } = req.params;
	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Invalid server ID', 400, 'INVALID_SERVER_ID');
	}

	const result = await serverServices.leaveServer(serverId, req.user.user_id);

	res.status(200).json(result);
});

const getDME2EEPeerKey = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const { serverId } = req.params;
	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Invalid server ID', 400, 'INVALID_SERVER_ID');
	}

	const result = await serverServices.getDME2EEPeerKey(serverId, req.user.user_id);
	res.status(200).json(result);
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
	addServerMember,
	getOrCreateDM,
	leaveServer,
	getDME2EEPeerKey,
};
