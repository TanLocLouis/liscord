import express from 'express';
import { body, param } from 'express-validator';
import channelController from '../controllers/channelController.js';
import { authenticate } from '../middleware/authenticate.js';
import validateData from '../middleware/validateData.js';

const router = express.Router();

// GET /api/channels/server/:serverId
router.get(
	'/server/:serverId',
	authenticate,
	[
		param('serverId')
			.isString()
			.trim()
			.isLength({ min: 1, max: 36 })
			.withMessage('Server id is required'),
	],
	validateData,
	channelController.getServerChannels
);

// POST /api/channels
router.post(
	'/',
	authenticate,
	[
		body('serverId')
			.isString()
			.trim()
			.isLength({ min: 1, max: 36 })
			.withMessage('Server id is required'),
		body('channelName')
			.isString()
			.trim()
			.isLength({ min: 1, max: 255 })
			.withMessage('Channel name is required and must be less than 256 characters'),
		body('type')
			.optional()
			.isString()
			.isIn(['text', 'voice'])
			.withMessage("Type must be either 'text' or 'voice'"),
		body('position')
			.optional()
			.isInt({ min: 0 })
			.withMessage('Position must be a non-negative integer'),
	],
	validateData,
	channelController.createChannel
);

// PATCH /api/channels/:channelId/name
router.patch(
	'/:channelId/name',
	authenticate,
	[
		param('channelId')
			.isString()
			.trim()
			.isLength({ min: 1, max: 36 })
			.withMessage('Channel id is required'),
		body('newName')
			.isString()
			.trim()
			.isLength({ min: 1, max: 255 })
			.withMessage('New channel name is required and must be less than 256 characters'),
	],
	validateData,
	channelController.renameChannel
);

router.delete(
	'/:channelId',
	authenticate,
	[
		param('channelId')
			.isString()
			.trim()
			.isLength( { min: 1, max: 36 })
			.withMessage('Channel id is required'),
	],
	validateData,
	channelController.deleteChannel
)

export default router;
