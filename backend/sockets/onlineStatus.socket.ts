import type { Server as SocketIOServer, Socket } from 'socket.io';
import utils from './utils.js';

const onlineUserList = new Set<string | undefined>();
const addOnlineUser = (userId: string | undefined) => {
    onlineUserList.add(userId);
}

const removeOnlineUser = (userId: string | undefined) => {
    onlineUserList.delete(userId);
}

const countOnlineUsers = () => {
    return onlineUserList.size;
}

const getOnlineUsers = () => {
    return Array.from(onlineUserList).filter((userId): userId is string => typeof userId === 'string');
}

const isUserOnline = (userId: string | undefined) => {
    return onlineUserList.has(userId);
}

const onlineStatusSocket = (io: SocketIOServer, socket: Socket) => {
    const authUser = utils.parseUserFromSocket(socket);

    addOnlineUser(authUser?.userId);

    // io.emit('user_online', { userId: authUser?.userId, username: authUser?.username });
    // io.emit('online_user_count', { count: countOnlineUsers() });
    // io.emit('get_online_users', { users: getOnlineUsers() });

    socket.on('disconnect', () => {
        removeOnlineUser(authUser?.userId);
        // io.emit('user_offline', { userId: authUser?.userId, username: authUser?.username });
        // io.emit('online_user_count', { count: countOnlineUsers() });
    });
}

export default onlineStatusSocket