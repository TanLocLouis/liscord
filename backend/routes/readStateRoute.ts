import express from 'express';
import validateData from '../middleware/validateData.js';
import { authenticate } from '../middleware/authenticate.js';
import { param } from 'express-validator';

const router = express.Router();

// POST /read-state/server/:serverId/channel/:channelId
router.post('/server/:serverId/channel/:channelId',
    authenticate,
    [
        param('serverId')
            .isString()
            .trim()
            .isUUID()
            .withMessage('Server id must be a valid UUID'),
        param('channelId')
            .isString()
            .trim()
            .isUUID()
            .withMessage('Channel id must be a valid UUID'),
    ],
    validateData,
);

// GET /read-state/server/:serverId/
router.get('/server/:serverId',
    authenticate,
    [
        param('serverId')
            .isString()
            .trim()
            .isUUID()
            .withMessage('Server id must be a valid UUID'),
    ],
    validateData,
);

// GET /read-state/server/:serverId/channel/:channelId
router.get('/server/:serverId/channel/:channelId',
    authenticate,
    [
        param('serverId')
            .isString()
            .trim()
            .isUUID()
            .withMessage('Server id must be a valid UUID'),
        param('channelId')
            .isString()
            .trim()
            .isUUID()
            .withMessage('Channel id must be a valid UUID'),
    ],
    validateData,
);

export default router;