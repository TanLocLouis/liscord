import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import serverServices from '../services/serverServices.js';

type CreateServerBody = {
	serverName: string;
	description?: string;
	serverIcon?: string;
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
	
	const result = await serverServices.createServer(userId, createPayload);

	res.status(201).json(result);
});

const getJoinedServers = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const result = await serverServices.getJoinedServers(req.user.user_id);

	res.status(200).json(result);
});

export default {
	createServer,
	getJoinedServers,
};
