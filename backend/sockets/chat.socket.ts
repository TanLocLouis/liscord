import jwt from 'jsonwebtoken';
import type { Server as SocketIOServer, Socket } from 'socket.io';
import messageServices from '../services/messageServices.js';

type AuthUser = {
	userId: string;
	username: string | null;
};

type SendMessagePayload = {
	roomId?: unknown;
	channelId?: unknown;
	content?: unknown;
	type?: unknown;
	replyTo?: unknown;
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

const chatSocket = (io: SocketIOServer, socket: Socket) => {
	const authUser = parseUserFromSocket(socket);

	socket.on('join_room', (roomId: unknown) => {
		if (typeof roomId !== 'string' || !roomId.trim()) {
			socket.emit('socket_error', { message: 'Invalid room id' });
			return;
		}

		socket.join(roomId);
	});

	socket.on('leave_room', (roomId: unknown) => {
		if (typeof roomId !== 'string' || !roomId.trim()) {
			socket.emit('socket_error', { message: 'Invalid room id' });
			return;
		}

		socket.leave(roomId);
	});

	socket.on('send_message', async (data: SendMessagePayload) => {
		try {
			if (!authUser?.userId) {
				socket.emit('socket_error', { message: 'Unauthorized' });
				return;
			}

			if (!data || typeof data !== 'object') {
				socket.emit('socket_error', { message: 'Invalid payload' });
				return;
			}

			const roomId = typeof data.roomId === 'string' ? data.roomId.trim() : '';
			const channelId = typeof data.channelId === 'string' && data.channelId.trim() ? data.channelId.trim() : roomId;
			const content = typeof data.content === 'string' ? data.content.trim() : '';

			if (!roomId || !channelId || !content) {
				socket.emit('socket_error', { message: 'roomId, channelId/roomId and content are required' });
				return;
			}
            
            // Create message payload for database insertion
			const payload = {
				channelId,
				content,
				...(typeof data.type === 'string' && data.type.trim() ? { type: data.type.trim() } : {}),
				...(typeof data.replyTo === 'string' && data.replyTo.trim() ? { replyTo: data.replyTo.trim() } : {}),
			};

            // Create the message in the database
			const created = await messageServices.createMessage(authUser.userId, payload);
            
            // Broadcast the new message to all clients in the room
			io.to(roomId).emit('receive_message', {
				channel_id: channelId,
				message_id: created.messageId,
				user_id: authUser.userId,
				user_name: authUser.username,
				content,
				type: payload.type ?? 'text',
				reply_to: payload.replyTo ?? null,
				created_at: new Date().toISOString(),
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to send message';
			socket.emit('socket_error', { message });
		}
	});
};

export default chatSocket;
