import express from 'express';
import cors from 'cors';
import type { RequestHandler } from 'express';
import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import serverRoutes from './routes/serverRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import initializeSockets from './sockets/index.js';

// Express App Setup
const app = express();
app.use(cors());
app.use(express.json());

// Socket.IO Setup
// TODO: This socket instance will be deployed
// Separatelly from this server
// In production
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
initializeSockets(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// Global Error Handler
app.use(errorHandler);

// 404 Handler
const notFoundHandler: RequestHandler = (req, res) => {
    res.status(404).json({
        error: 'NOT_FOUND',
        message: `Route ${req.originalUrl} not found`,
    });
};
app.use(notFoundHandler);

// Backend Listen
const PORT = Number(process.env.PORT ?? 3000);

httpServer.listen(PORT, () => {
    console.log(`[STATUS] Server is listening on port ${PORT}`);
});