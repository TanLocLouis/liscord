import type { Server as SocketIOServer, Socket } from 'socket.io';
import messageServices from '../services/messageServices.js';
import utils from './utils.js';

type SendMessagePayload = {
	roomId?: string;
	channelId?: string;
	content?: string;
	avatar?: string | null;
	type?: string;
	replyTo?: string | null;
	replyToContent?: string | null;
};

const typingUsers: Record<string, Set<string>> = {};

const chatSocket = (io: SocketIOServer, socket: Socket) => {
	const authUser = utils.parseUserFromSocket(socket);

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

	socket.on('start_typing', ( {channelId } : { channelId: string }) => {
		const authUser = utils.parseUserFromSocket(socket);
		const userName = authUser?.username;

		if (!userName) {
			socket.emit('socket_error', { message: 'Unauthorized' });
			return;
		}
		// console.log(`[DEBUG] User ${userId} is typing in channel ${channelId}`);
		if (!typingUsers[channelId]) {
			typingUsers[channelId] = new Set();
		}
		typingUsers[channelId].add(userName);
		io.to(channelId).emit('typing_users', Array.from(typingUsers[channelId]));
	});

	socket.on('stop_typing', ( { channelId } : { channelId: string }) => {
		const authUser = utils.parseUserFromSocket(socket);
		const userName = authUser?.username;

		if (!userName) {
			socket.emit('socket_error', { message: 'Unauthorized' });
			return;
		}
		// console.log(`[DEBUG] User ${userId} stopped typing in channel ${channelId}`);
		if (typingUsers[channelId]) {
			typingUsers[channelId].delete(userName);
			io.to(channelId).emit('typing_users', Array.from(typingUsers[channelId]));
		}
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
				avatar: data.avatar ?? null,
				type: data.type === 'text' ? 'text' : 'text',
				replyTo: typeof data.replyTo === 'string' && data.replyTo.trim() ? data.replyTo.trim() : null,
				replyToContent: typeof data.replyToContent === 'string' && data.replyToContent.trim() ? data.replyToContent.trim() : null,
			};

			console.log('[DEBUG]: ', data.avatar);

            // Create the message in the database
			const created = await messageServices.createMessage(authUser.userId, payload);
            
            // Broadcast the new message to all clients in the room
			io.to(roomId).emit('receive_message', {
				channel_id: channelId,
				message_id: created.messageId,
				user_id: authUser.userId,
				user_name: authUser.username,
				avatar: data.avatar ?? null,
				content,
				type: payload.type ?? 'text',
				reply_to: payload.replyTo ?? null,
				reply_to_content: payload.replyToContent ?? null,
				created_at: new Date().toISOString(),
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to send message';
			socket.emit('socket_error', { message });
		}
	});
};

export default chatSocket;
