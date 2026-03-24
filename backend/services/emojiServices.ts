import { basename, extname, resolve } from 'node:path';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import AppError from '../utils/AppError.js';
import serverModel from '../models/serverModel.js';
import emojiModel from '../models/emojiModel.js';
import { uploadEmojiFileToS3, uploadEmojiToS3 } from '../utils/s3AvatarStorage.js';

const DEFAULT_EMOJI_FILES = [
	'flustered.png',
	'idiot.png',
	'pepeyeababy.png',
	'sip.png',
	'think.png',
] as const;

const serviceDir = fileURLToPath(new URL('.', import.meta.url));
const defaultEmojiDir = resolve(serviceDir, '..', '..', 'tools', 'minio', 'emojis');

function normalizeEmojiName(input: string): string {
	return input.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '').slice(0, 100);
}

async function addServerEmoji(userId: string, serverId: string, emojiName: string, file: Express.Multer.File) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedServerId = serverId.trim();
	if (!normalizedServerId) {
		throw new AppError('Server id is required', 400, 'INVALID_SERVER_ID');
	}

	const normalizedEmojiName = normalizeEmojiName(emojiName);
	if (!normalizedEmojiName) {
		throw new AppError('Emoji name is required', 400, 'INVALID_EMOJI_NAME');
	}

	const server = await serverModel.getServerById(normalizedServerId);
	if (!server) {
		throw new AppError('Server not found', 404, 'SERVER_NOT_FOUND');
	}

	if (server.owner_id !== userId) {
		throw new AppError('Only the server owner can add custom emoji', 403, 'FORBIDDEN');
	}

	const existingEmoji = await emojiModel.getServerEmojiByName(normalizedServerId, normalizedEmojiName);
	if (existingEmoji) {
		throw new AppError('Emoji name already exists in this server', 400, 'EMOJI_NAME_EXISTS');
	}

	const imageUrl = await uploadEmojiToS3({
		serverId: normalizedServerId,
		fileBuffer: file.buffer,
		mimeType: file.mimetype,
		originalName: file.originalname,
	});

	const emojiId = await emojiModel.createEmoji({
		name: normalizedEmojiName,
		imageUrl,
		isCustom: true,
		createdBy: userId,
		serverId: normalizedServerId,
	});

	return {
		emojiId,
		name: normalizedEmojiName,
		imageUrl,
		message: 'Emoji added successfully',
	};
}

async function getServerEmojis(userId: string, serverId: string) {
	if (!userId) {
		throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
	}

	const normalizedServerId = serverId.trim();
	if (!normalizedServerId) {
		throw new AppError('Server id is required', 400, 'INVALID_SERVER_ID');
	}

	const isMember = await serverModel.isServerMember(normalizedServerId, userId);
	if (!isMember) {
		throw new AppError('Forbidden', 403, 'FORBIDDEN');
	}

	const emojis = await emojiModel.getServerEmojis(normalizedServerId);
	return { emojis };
}

async function seedDefaultServerEmojis(serverId: string): Promise<void> {
	const normalizedServerId = serverId.trim();
	if (!normalizedServerId) {
		return;
	}

	let availableFiles: Set<string>;
	try {
		availableFiles = new Set(await readdir(defaultEmojiDir));
	} catch (error) {
		console.warn('[WARN] Could not read default emoji directory', error);
		return;
	}

	for (const fileName of DEFAULT_EMOJI_FILES) {
		if (!availableFiles.has(fileName)) {
			console.warn(`[WARN] Default emoji file not found: ${fileName}`);
			continue;
		}

		const emojiName = normalizeEmojiName(basename(fileName, extname(fileName)));
		if (!emojiName) {
			continue;
		}

		const existingEmoji = await emojiModel.getServerEmojiByName(normalizedServerId, emojiName);
		if (existingEmoji) {
			continue;
		}

		const filePath = resolve(defaultEmojiDir, fileName);
		const imageUrl = await uploadEmojiFileToS3(normalizedServerId, filePath);
		await emojiModel.createEmoji({
			name: emojiName,
			imageUrl,
			isCustom: false,
			createdBy: null,
			serverId: normalizedServerId,
		});
	}
}

async function validateServerEmoji(serverId: string, emojiId: string) {
	const emoji = await emojiModel.getServerEmojiById(serverId, emojiId);
	if (!emoji) {
		throw new AppError('Emoji not found in this server', 404, 'EMOJI_NOT_FOUND');
	}

	return emoji;
}

async function getEmojiMapByIds(emojiIds: string[]) {
	const rows = await emojiModel.getEmojisByIds(emojiIds);
	const map = new Map<string, { name: string; imageUrl: string | null; unicode: string | null }>();
	for (const row of rows) {
		map.set(row.emoji_id, {
			name: row.name,
			imageUrl: row.image_url,
			unicode: row.unicode,
		});
	}
	return map;
}

export default {
	addServerEmoji,
	getServerEmojis,
	seedDefaultServerEmojis,
	validateServerEmoji,
	getEmojiMapByIds,
};
