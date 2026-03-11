import type { Server as SocketIOServer, Socket } from 'socket.io';
import chatSocket from './chat.socket.js';

const initializeSockets = (io: SocketIOServer) => {
	io.on('connection', (socket: Socket) => {
		chatSocket(io, socket);
	});
};

export default initializeSockets;
