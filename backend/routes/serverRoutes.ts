import express from 'express';
import { body, param } from 'express-validator';
import serverController from '../controllers/serverController.js';
import { authenticate } from '../middleware/authenticate.js';
import validateData from '../middleware/validateData.js';
import { iconUploadMiddleware } from '../middleware/avatarUploadMiddleware.js';
import emojiRoutes from './emojiRoutes.js';

const router = express.Router();

// POST /api/servers
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
		body('type')
			.optional()
			.isIn(['group', 'dm'])
			.withMessage('Server type must be either "group" or "dm"'),
		body('serverIcon')
			.optional()
			.isString()
			.isLength({ max: 45 })
			.withMessage('Server icon must be less than 46 characters'),
	],
	validateData,
	serverController.createServer
);

// GET /api/servers/joined
router.get('/joined', authenticate, serverController.getJoinedServers);

// GET /api/servers/:serverId
router.get('/:serverId', authenticate, serverController.getServerDetails);

// /api/servers/:serverId/emojis
router.use('/:serverId/emojis', emojiRoutes);


// POST /api/servers/:serverId/invites
router.post(
	'/:serverId/invites',
	authenticate,
	[
		body('maxUses')
			.optional()
			.isInt({ min: 1, max: 1000000 })
			.withMessage('maxUses must be an integer greater than 0'),
		body('expiresInHours')
			.optional()
			.isInt({ min: 1, max: 24 * 365 })
			.withMessage('expiresInHours must be between 1 and 8760'),
	],
	validateData,
	serverController.createInvite
);

// POST /api/servers/invites/:code/join
router.post(
	'/invites/:code/join',
	authenticate,
	[
		param('code')
			.isString()
			.isLength({ min: 4, max: 20 })
			.matches(/^[A-Za-z0-9]+$/)
			.withMessage('Invite code is invalid'),
	],
	validateData,
	serverController.joinServerByInvite
);

// PATCH /api/server/<serverId>/name
router.patch('/:serverId/name',
    authenticate,
	[
		param('serverId')
			.isString()
			.trim()
			.isLength({ min: 36, max: 36 })
			.withMessage('Server ID is required'),
		body('serverName')
			.isString()
			.trim()
			.isLength({ min: 1, max: 255 })
			.withMessage('Server name is required and must be less than 256 characters'),
	],
	validateData,
    serverController.updateServerName
);

// PATCH /api/server/<serverId>/icon
router.patch('/:serverId/icon',
    authenticate,
    iconUploadMiddleware,
    serverController.updateServerIcon
);

// POST /api/servers/:serverId/members
router.post('/:serverId/members',
	authenticate,
	[
		param('serverId')
			.isString()
			.trim()
			.isLength({ min: 36, max: 36 })
			.withMessage('Server ID is required'),
		body('userId')
			.isString()
			.trim()
			.isLength({ min: 1 })
			.withMessage('User ID is required'),
	],
	validateData,
	serverController.addServerMember
);

// POST /api/servers/dm/get-or-create
router.post('/dm/get-or-create',
	authenticate,
	[
		body('targetUserId')
			.isString()
			.trim()
			.isLength({ min: 1 })
			.withMessage('Target user ID is required'),
	],
	validateData,
	serverController.getOrCreateDM
);

// GET /api/servers/:serverId/dm/e2ee-peer-key
router.get('/:serverId/dm/e2ee-peer-key',
	authenticate,
	serverController.getDME2EEPeerKey
);

// DELETE /api/servers/:serverId/leave
router.delete('/:serverId/leave',
	authenticate,
	[
		param('serverId')
			.isString()
			.trim()
			.isLength({ min: 36, max: 36 })
			.withMessage('Server ID is required'),
	],
	validateData,
	serverController.leaveServer
);

export default router;
