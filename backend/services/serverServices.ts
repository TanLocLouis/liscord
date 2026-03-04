import { randomUUID } from 'node:crypto';
import AppError from '../utils/AppError.js';
import serverModel from '../models/serverModel.js';

type CreateServerPayload = {
	serverName: string;
	description?: string;
	serverIcon?: string;
};

async function createServer(ownerId: string, payload: CreateServerPayload) {
	if (!ownerId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedServerName = payload.serverName.trim();
	if (!normalizedServerName) {
		throw new AppError('Server name is required', 400, 'INVALID_SERVER_NAME');
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

async function getJoinedServers(userId: string) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const servers = await serverModel.getJoinedServersByUserId(userId);

	return {
		servers,
	};
}

export default {
	createServer,
	getJoinedServers,
};
