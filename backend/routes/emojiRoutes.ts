import express from 'express';
import { body, param } from 'express-validator';
import emojiController from '../controllers/emojiController.js';
import { authenticate } from '../middleware/authenticate.js';
import { emojiUploadMiddleware } from '../middleware/avatarUploadMiddleware.js';
import validateData from '../middleware/validateData.js';

const router = express.Router({ mergeParams: true });

// GET /api/servers/:serverId/emojis
router.get(
	'/',
	authenticate,
	[
		param('serverId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Server id must be a valid UUID'),
	],
	validateData,
	emojiController.getServerEmojis
);

// POST /api/servers/:serverId/emojis
router.post(
	'/',
	authenticate,
	emojiUploadMiddleware,
	[
		param('serverId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Server id must be a valid UUID'),
		body('name')
			.isString()
			.trim()
			.isLength({ min: 1, max: 100 })
			.withMessage('Emoji name is required and must be less than 101 characters'),
	],
	validateData,
	emojiController.addServerEmoji
);

// DELETE /api/servers/:serverId/emojis/:emojiId
router.delete(
	'/:emojiId',
	authenticate,
	[
		param('emojiId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Emoji id must be a valid UUID'),
	],
	validateData,
	emojiController.deleteServerEmoji
);

export default router;
