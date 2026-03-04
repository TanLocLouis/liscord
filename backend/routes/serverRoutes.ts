import express from 'express';
import { body } from 'express-validator';
import serverController from '../controllers/serverController.js';
import { authenticate } from '../middleware/authenticate.js';
import validateData from '../middleware/validateData.js';

const router = express.Router();

router.get('/joined', authenticate, serverController.getJoinedServers);

router.post(
	'/',
	authenticate,
	[
		body('serverName')
			.isString()
			.trim()
			.isLength({ min: 1, max: 255 })
			.withMessage('Server name is required and must be less than 256 characters'),
		body('description')
			.optional()
			.isString()
			.isLength({ max: 1023 })
			.withMessage('Description must be less than 1024 characters'),
		body('serverIcon')
			.optional()
			.isString()
			.isLength({ max: 45 })
			.withMessage('Server icon must be less than 46 characters'),
	],
	validateData,
	serverController.createServer
);

export default router;
