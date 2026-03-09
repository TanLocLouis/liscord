import express from 'express';
import cors from 'cors';
import type { RequestHandler } from 'express';
import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import serverRoutes from './routes/serverRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`[STATUS] Server is listening on port ${PORT}`);
});