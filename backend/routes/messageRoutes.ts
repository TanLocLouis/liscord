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
		query('cursor')
			.optional()
			.isString()
			.trim()
			.isLength({ min: 1, max: 4096 })
			.withMessage('Cursor must be a valid pagination token'),
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
			.optional()
			.isString()
			.trim()
			.isLength({ min: 1, max: 2000 })
			.withMessage('Content must be less than 2000 characters'),
		body('ciphertext')
			.optional()
			.isString()
			.trim()
			.isLength({ min: 1, max: 12000 })
			.withMessage('Ciphertext must be between 1 and 12000 characters'),
		body('iv')
			.optional()
			.isString()
			.trim()
			.isLength({ min: 8, max: 128 })
			.withMessage('IV must be between 8 and 128 characters'),
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
		body().custom((value) => {
			const hasContent = typeof value.content === 'string' && value.content.trim().length > 0;
			const hasCiphertext = typeof value.ciphertext === 'string' && value.ciphertext.trim().length > 0;
			const hasIv = typeof value.iv === 'string' && value.iv.trim().length > 0;

			if (!hasContent && !hasCiphertext) {
				throw new Error('Either content or ciphertext is required');
			}

			if (hasCiphertext && !hasIv) {
				throw new Error('Encrypted payload requires iv');
			}

			return true;
		}),
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
