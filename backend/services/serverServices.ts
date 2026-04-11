import { randomUUID } from 'node:crypto';
import AppError from '../utils/AppError.js';
import serverModel from '../models/serverModel.js';
import { uploadAvatarToS3, uploadIconToS3 } from '../utils/s3AvatarStorage.js';
import emojiServices from './emojiServices.js';
import usersModel from '../models/usersModel.js';

type CreateServerPayload = {
	serverName: string;
	description?: string;
	serverIcon?: string;
	type?: 'group' | 'dm';
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
	const MAX_SERVERS_PER_USER = parseInt(process.env.MAX_SERVERS_PER_USER || '50', 10);
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
		type: payload.type ?? 'group',
		createdAt: new Date().toISOString(),
	});

	// Add owner as a member of the server
	await serverModel.createServerMember(serverId, ownerId);

	// Seed default server emojis from tools/minio/emojis
	await emojiServices.seedDefaultServerEmojis(serverId);

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

	const server = await serverModel.getServerById(serverId);
	if (!server) {
		throw new AppError('Server not found', 404, 'SERVER_NOT_FOUND');
	}

	// DM servers can only be joined via invite
	if (server.type === 'dm') {
		throw new AppError('Direct message servers can only be joined via invite', 403, 'DM_JOIN_INVITE_ONLY');
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
			if (error.message === 'DM_SERVER_FULL') {
				throw new AppError('Direct message servers can only have 2 members', 403, 'DM_SERVER_FULL');
			}
			if (error.message === 'SERVER_NOT_FOUND') {
				throw new AppError('Server not found', 404, 'SERVER_NOT_FOUND');
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

async function addServerMember(serverId: string, userIdToAdd: string, requesterId: string) {
	if (!serverId || !userIdToAdd || !requesterId) {
		throw new AppError('Invalid parameters', 400, 'INVALID_PARAMETERS');
	}

	const server = await serverModel.getServerById(serverId);
	if (!server) {
		throw new AppError('Server not found', 404, 'SERVER_NOT_FOUND');
	}

	// Only the server owner can add members to a DM
	if (server.type === 'dm' && server.owner_id !== requesterId) {
		throw new AppError('Only the server owner can add members to a DM', 403, 'FORBIDDEN');
	}

	// DM servers can only have 2 members
	if (server.type === 'dm') {
		const isMember = await serverModel.isServerMember(serverId, userIdToAdd);
		if (isMember) {
			throw new AppError('User is already a member of this DM', 400, 'ALREADY_MEMBER');
		}
	}

	await serverModel.createServerMember(serverId, userIdToAdd);

	return {
		message: 'Member added successfully',
	};
}

async function getExistingDM(userId1: string, userId2: string) {
	if (!userId1 || !userId2) {
		throw new AppError('Invalid user IDs', 400, 'INVALID_USER_IDS');
	}

	const dmServer = await serverModel.getExistingDM(userId1, userId2);
	return dmServer;
}

async function getOrCreateDM(userId1: string, userId2: string) {
	if (!userId1 || !userId2) {
		throw new AppError('Invalid user IDs', 400, 'INVALID_USER_IDS');
	}

	if (userId1 === userId2) {
		throw new AppError('Cannot create DM with yourself', 400, 'INVALID_DM');
	}

	// Check if DM already exists
	const existingDM = await serverModel.getExistingDM(userId1, userId2);
	if (existingDM) {
		return {
			serverId: existingDM.server_id,
			existed: true,
			message: 'DM already exists',
		};
	}

	// Create new DM server
	const serverId = randomUUID();
	const userName1 = await usersModel.getUserNameByUserId(userId1);
	const userName2 = await usersModel.getUserNameByUserId(userId2);
	const dmServerName = `DM: ${userName1} & ${userName2}`;
	await serverModel.createServer({
		serverId,
		serverName: dmServerName,
		description: '',
		serverIcon: '',
		membersCount: 1,
		ownerId: userId1,
		type: 'dm',
		createdAt: new Date().toISOString(),
	});

	// Add both users as members
	await serverModel.createServerMember(serverId, userId1);
	await serverModel.createServerMember(serverId, userId2);

	// Create default DM channel
	const channelServices = (await import('./channelServices.js')).default;
	await channelServices.createChannel(userId1, {
		serverId,
		channelName: 'dm',
		type: 'text',
		position: 0,
	});

	// Seed default emojis
	await emojiServices.seedDefaultServerEmojis(serverId);

	return {
		serverId,
		existed: false,
		message: 'DM created successfully',
	};
}

async function leaveServer(serverId: string, userId: string) {
	if (!serverId || !userId) {
		throw new AppError('Invalid parameters', 400, 'INVALID_PARAMETERS');
	}

	const server = await serverModel.getServerById(serverId);
	if (!server) {
		throw new AppError('Server not found', 404, 'SERVER_NOT_FOUND');
	}

	const isMember = await serverModel.isServerMember(serverId, userId);
	if (!isMember) {
		throw new AppError('You are not a member of this server', 403, 'FORBIDDEN');
	}

	// Prevent DM owner from leaving (but allow other member to leave)
	if (server.type === 'dm' && server.owner_id === userId) {
		throw new AppError('DM owner cannot leave the server', 403, 'CANNOT_LEAVE_DM');
	}

	// Remove user from server
	await serverModel.removeServerMember(serverId, userId);

	return {
		message: 'Left server successfully',
	};
}

async function getDME2EEPeerKey(serverId: string, requesterId: string) {
	if (!serverId || !requesterId) {
		throw new AppError('Invalid parameters', 400, 'INVALID_PARAMETERS');
	}

	const server = await serverModel.getServerById(serverId);
	if (!server) {
		throw new AppError('Server not found', 404, 'SERVER_NOT_FOUND');
	}

	if (server.type !== 'dm') {
		throw new AppError('E2EE peer key endpoint is DM-only', 400, 'NOT_DM_SERVER');
	}

	const isMember = await serverModel.isServerMember(serverId, requesterId);
	if (!isMember) {
		throw new AppError('You are not a member of this server', 403, 'FORBIDDEN');
	}

	const memberIds = await serverModel.getServerMemberIds(serverId);
	const peerUserId = memberIds.find((memberId) => memberId !== requesterId);
	if (!peerUserId) {
		throw new AppError('No DM peer found yet', 409, 'DM_PEER_NOT_FOUND');
	}

	const key = await usersModel.getPublicEncryptionKeyByUserId(peerUserId);
	if (!key) {
		throw new AppError('DM peer public key is not available yet', 404, 'PEER_PUBLIC_KEY_NOT_FOUND');
	}

	return {
		peerUserId,
		publicKey: key.public_key,
		algorithm: key.algorithm,
		updatedAt: key.updated_at,
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
	addServerMember,
	getExistingDM,
	getOrCreateDM,
	leaveServer,
	getDME2EEPeerKey,
};
