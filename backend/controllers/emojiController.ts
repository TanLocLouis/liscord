import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import emojiServices from '../services/emojiServices.js';

const addServerEmoji = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const { serverId } = req.params;
	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Invalid server ID', 400, 'INVALID_SERVER_ID');
	}

	const { name } = req.body as { name?: string };
	if (!name || typeof name !== 'string') {
		throw new AppError('Emoji name is required', 400, 'INVALID_EMOJI_NAME');
	}

	if (!req.file) {
		throw new AppError('No emoji file uploaded', 400, 'NO_EMOJI_FILE_UPLOADED');
	}

	const result = await emojiServices.addServerEmoji(req.user.user_id, serverId, name, req.file);
	res.status(201).json(result);
});

const getServerEmojis = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const { serverId } = req.params;
	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Invalid server ID', 400, 'INVALID_SERVER_ID');
	}

	const result = await emojiServices.getServerEmojis(req.user.user_id, serverId);
	res.status(200).json(result);
});

const deleteServerEmoji = asyncHandler(async (req, res) => {
	if (!req.user?.user_id || typeof req.user.user_id !== 'string') {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const { serverId, emojiId } = req.params;
	if (!serverId || typeof serverId !== 'string') {
		throw new AppError('Invalid server ID', 400, 'INVALID_SERVER_ID');
	}
	if (!emojiId || typeof emojiId !== 'string') {
		throw new AppError('Invalid emoji ID', 400, 'INVALID_EMOJI_ID');
	}

	await emojiServices.deleteServerEmoji(req.user.user_id, serverId, emojiId);
	res.status(204).send();
});

export default {
	addServerEmoji,
	getServerEmojis,
	deleteServerEmoji
};
