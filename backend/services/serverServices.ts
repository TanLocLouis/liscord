import { randomUUID } from 'node:crypto';
import AppError from '../utils/AppError.js';
import serverModel from '../models/serverModel.js';
import { uploadAvatarToS3, uploadIconToS3 } from '../utils/s3AvatarStorage.js';

type CreateServerPayload = {
	serverName: string;
	description?: string;
	serverIcon?: string;
};

type CreateInvitePayload = {
	maxUses?: number;
	expiresInHours?: number;
};

function generateInviteCode(length = 10): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
	let code = '';

	for (let i = 0; i < length; i += 1) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		code += chars[randomIndex];
	}

	return code;
}

async function createServer(ownerId: string, payload: CreateServerPayload) {
	if (!ownerId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedServerName = payload.serverName.trim();
	if (!normalizedServerName) {
		throw new AppError('Server name is required', 400, 'INVALID_SERVER_NAME');
	}

	// Check the number of servers the user has created
	// Set the limit in MAX_SERVERS_PER_USER environment variable
	const MAX_SERVERS_PER_USER = parseInt(process.env.MAX_SERVERS_PER_USER || '2', 10);
	const userServersCount = await serverModel.getUserCreatedServersCount(ownerId);
	if (userServersCount >= MAX_SERVERS_PER_USER) {
		throw new AppError(`You have reached the maximum limit of ${MAX_SERVERS_PER_USER} servers`, 400, 'SERVER_LIMIT_REACHED');
	}

	const serverId = randomUUID();

	// Create server
	await serverModel.createServer({
		serverId,
		serverName: normalizedServerName,
		description: payload.description?.trim() ?? '',
		serverIcon: payload.serverIcon?.trim() ?? '',
		membersCount: 1,
		ownerId,
		createdAt: new Date().toISOString(),
	});

	// Add owner as a member of the server
	await serverModel.createServerMember(serverId, ownerId);

	return {
		serverId,
		message: 'Server created successfully',
	};
}

async function getServerDetails(serverId: string, userId: string) {
	if (!serverId || !userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}
	
	const server = await serverModel.getServerById(serverId);
	if (!server) {
		throw new AppError('Server not found', 404, 'SERVER_NOT_FOUND');
	}
	
	const isMember = await serverModel.isServerMember(serverId, userId);
	if (!isMember) {
		throw new AppError('You are not a member of this server', 403, 'FORBIDDEN');
	}
	
	return {
		server,
	};
}

async function getJoinedServers(userId: string) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const servers = await serverModel.getJoinedServersByUserId(userId);

	return {
		servers,
	};
}

async function joinServer(serverId: string, userId: string) {
	if (!serverId || !userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	await serverModel.joinServer(serverId, userId);

	return {
		message: 'Joined server successfully',
	};
}

async function createInvite(serverId: string, userId: string, payload: CreateInvitePayload) {
	if (!serverId || !userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const isMember = await serverModel.isServerMember(serverId, userId);
	if (!isMember) {
		throw new AppError('You are not a member of this server', 403, 'FORBIDDEN');
	}

	const maxUses = payload.maxUses ?? null;
	const expiresAt = payload.expiresInHours
		? new Date(Date.now() + payload.expiresInHours * 60 * 60 * 1000)
		: null;

	let inviteCode = '';
	for (let attempts = 0; attempts < 5; attempts += 1) {
		const nextCode = generateInviteCode(10);
		const existingInvite = await serverModel.getInviteByCode(nextCode);
		if (!existingInvite) {
			inviteCode = nextCode;
			break;
		}
	}

	if (!inviteCode) {
		throw new AppError('Could not generate invite code, please try again', 500, 'INVITE_GENERATION_FAILED');
	}

	await serverModel.createInvite({
		inviteId: randomUUID(),
		code: inviteCode,
		serverId,
		createdBy: userId,
		maxUses,
		expiresAt,
	});

	const baseInviteUrl = process.env.FRONTEND_URL ?? process.env.APP_URL;
	const inviteLink = baseInviteUrl
		? `${baseInviteUrl.replace(/\/$/, '')}/invite/${inviteCode}`
		: `/invite/${inviteCode}`;

	return {
		code: inviteCode,
		inviteLink,
		expiresAt: expiresAt?.toISOString() ?? null,
		maxUses,
	};
}

async function joinServerByInvite(code: string, userId: string) {
	if (!code || !userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	try {
		const result = await serverModel.joinServerByInviteCode(code, userId);

		return {
			serverId: result.serverId,
			joined: result.joined,
			message: result.joined ? 'Joined server successfully' : 'User is already a member of this server',
		};
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === 'INVITE_NOT_FOUND') {
				throw new AppError('Invite not found', 404, 'INVITE_NOT_FOUND');
			}
			if (error.message === 'INVITE_EXPIRED') {
				throw new AppError('Invite has expired', 400, 'INVITE_EXPIRED');
			}
			if (error.message === 'INVITE_MAX_USES_REACHED') {
				throw new AppError('Invite has reached max uses', 400, 'INVITE_MAX_USES_REACHED');
			}
		}

		throw error;
	}
}

async function updateServerName(serverId: string, userId: string, newName: string) {
	if (!serverId || !userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedServerName = newName.trim();
	if (!normalizedServerName) {
		throw new AppError('Server name is required', 400, 'INVALID_SERVER_NAME');
	}

	const server = await serverModel.getServerById(serverId);
	if (!server) {
		throw new AppError('Server not found', 404, 'SERVER_NOT_FOUND');
	}

	if (server.owner_id !== userId) {
		throw new AppError('Only the server owner can update the server name', 403, 'FORBIDDEN');
	}

	await serverModel.updateServerName(serverId, normalizedServerName);

	return {
		message: 'Server name updated successfully',
	};
}

async function updateServerIcon(serverId: string, userId: string, iconFile: Express.Multer.File) {
	if (!serverId || !userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	// Check does the server exist
	const server = await serverModel.getServerById(serverId);
	if (!server) {
		throw new AppError('Server not found', 404, 'SERVER_NOT_FOUND');
	}

	// Check is the user the owner of the server
	if (server.owner_id !== userId) {
		throw new AppError('Only the server owner can update the server icon', 403, 'FORBIDDEN');
	}

	// Upload icon to S3 and get the URL
    const iconUrl = await uploadIconToS3({
        userId,
        fileBuffer: iconFile.buffer,
        mimeType: iconFile.mimetype,
    });

	await serverModel.updateServerIcon(serverId, iconUrl);

	return {
		message: 'Server icon updated successfully',
	};

}

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
