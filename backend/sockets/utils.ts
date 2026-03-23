import jwt from 'jsonwebtoken';
import type { Server as SocketIOServer, Socket } from 'socket.io';

type AuthUser = {
	userId: string;
	username: string | null;
};

const parseUserFromSocket = (socket: Socket): AuthUser | null => {
	const authToken = socket.handshake?.auth?.token;
	const authHeader = socket.handshake?.headers?.authorization;
	const bearerToken = typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;
	const token = typeof authToken === 'string' ? authToken : bearerToken;

	if (!token) {
		return null;
	}

	const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
	if (!secret) {
		return null;
	}

	try {
		const decoded = jwt.verify(token, secret);
		if (typeof decoded === 'string') {
			return null;
		}

		if (decoded && typeof decoded === 'object' && typeof decoded.user_id === 'string') {
			return {
				userId: decoded.user_id,
				username: typeof decoded.username === 'string' ? decoded.username : null,
			};
		}

		return null;
	} catch {
		return null;
	}
};

export default { parseUserFromSocket };