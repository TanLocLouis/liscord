import express from 'express';
import { body, param, query } from 'express-validator';
import messageController from '../controllers/messageController.js';
import { authenticate } from '../middleware/authenticate.js';
import validateData from '../middleware/validateData.js';

const router = express.Router();

router.get(
	'/channel/:channelId',
	authenticate,
	[
		param('channelId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Channel id must be a valid UUID'),
		query('limit')
			.optional()
			.isInt({ min: 1, max: 100 })
			.withMessage('Limit must be between 1 and 100'),
	],
	validateData,
	messageController.getChannelMessages
);

router.post(
	'/',
	authenticate,
	[
		body('channelId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Channel id must be a valid UUID'),
		body('content')
			.isString()
			.trim()
			.isLength({ min: 1, max: 2000 })
			.withMessage('Content is required and must be less than 2000 characters'),
		body('type')
			.optional()
			.isString()
			.trim()
			.isLength({ min: 1, max: 50 })
			.withMessage('Type must be less than 50 characters'),
		body('replyTo')
			.optional()
			.isString()
			.trim()
			.isUUID()
			.withMessage('Reply to must be a valid UUID'),
	],
	validateData,
	messageController.createMessage
);

router.get(
	'/:messageId/reactions',
	authenticate,
	[
		param('messageId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Message id must be a valid UUID'),
		query('channelId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Channel id must be a valid UUID'),
	],
	validateData,
	messageController.getMessageReactions
);

router.post(
	'/:messageId/reactions',
	authenticate,
	[
		param('messageId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Message id must be a valid UUID'),
		body('channelId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Channel id must be a valid UUID'),
		body('emojiId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Emoji id must be a valid UUID'),
	],
	validateData,
	messageController.addReaction
);

router.delete(
	'/:messageId/reactions/:emojiId',
	authenticate,
	[
		param('messageId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Message id must be a valid UUID'),
		param('emojiId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Emoji id must be a valid UUID'),
		body('channelId')
			.isString()
			.trim()
			.isUUID()
			.withMessage('Channel id must be a valid UUID'),
	],
	validateData,
	messageController.removeReaction
);

export default router;
