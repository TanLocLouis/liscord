import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);


// Global Error Handler
import errorHandler from './middleware/errorHandler.js';
app.use(errorHandler);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        error: 'NOT_FOUND',
        message: `Route ${req.originalUrl} not found`,
    });
});

// Backend Listen
app.listen(3000, () => {
    console.log('[STATUS] Server is listeing on port 3000');
})