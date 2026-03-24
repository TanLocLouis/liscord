import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import AppError from './AppError.js';

type UploadAvatarInput = {
    userId: string;
    fileBuffer: Buffer;
    mimeType: string;
};

const awsRegion = process.env.AWS_REGION || 'us-east-1';
const awsBucket = process.env.AWS_S3_BUCKET;
const s3Endpoint = process.env.AWS_S3_ENDPOINT || 'http://localhost:9000';
const s3AccessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
const s3SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
const forcePathStyle = (process.env.AWS_S3_FORCE_PATH_STYLE || 'true').toLowerCase() === 'true';

if (!awsBucket) {
    console.warn('[STATUS] Missing AWS_S3_BUCKET, avatar uploads will fail until configured.');
}

const s3Client = new S3Client({
    region: awsRegion,
    endpoint: s3Endpoint,
    credentials: {
        accessKeyId: s3AccessKeyId,
        secretAccessKey: s3SecretAccessKey,
    },
    forcePathStyle,
});

const extensionByMimeType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

async function uploadAvatarToS3({ userId, fileBuffer, mimeType }: UploadAvatarInput): Promise<string> {
    if (!awsBucket) {
        throw new AppError('AWS S3 is not configured', 500, 'AWS_S3_NOT_CONFIGURED');
    }

    const extension = extensionByMimeType[mimeType] || 'bin';
    const uniqueSuffix = crypto.randomUUID();
    const keyPrefix = process.env.AWS_S3_AVATAR_PREFIX || 'avatars';
    const objectKey = `${keyPrefix}/${userId}-${uniqueSuffix}.${extension}`;

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: awsBucket,
            Key: objectKey,
            Body: fileBuffer,
            ContentType: mimeType,
        }));
    } catch (error) {
        console.error('[ERROR] Failed uploading avatar to S3', error);
        throw new AppError('Failed to upload avatar', 502, 'S3_UPLOAD_FAILED');
    }

    const normalizedEndpoint = s3Endpoint.endsWith('/') ? s3Endpoint.slice(0, -1) : s3Endpoint;
    return `${normalizedEndpoint}/${awsBucket}/${objectKey}`;
}

async function uploadIconToS3({ userId, fileBuffer, mimeType }: UploadAvatarInput): Promise<string> {
    if (!awsBucket) {
        throw new AppError('AWS S3 is not configured', 500, 'AWS_S3_NOT_CONFIGURED');
    }

    const extension = extensionByMimeType[mimeType] || 'bin';
    const uniqueSuffix = crypto.randomUUID();
    const keyPrefix = process.env.AWS_S3_ICON_PREFIX || 'icons';
    const objectKey = `${keyPrefix}/${userId}-${uniqueSuffix}.${extension}`;

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: awsBucket,
            Key: objectKey,
            Body: fileBuffer,
            ContentType: mimeType,
        }));
    } catch (error) {
        console.error('[ERROR] Failed uploading icon to S3', error);
        throw new AppError('Failed to upload icon', 502, 'S3_UPLOAD_FAILED');
    }

    const normalizedEndpoint = s3Endpoint.endsWith('/') ? s3Endpoint.slice(0, -1) : s3Endpoint;
    return `${normalizedEndpoint}/${awsBucket}/${objectKey}`;
}

async function uploadEmojiToS3({
    serverId,
    fileBuffer,
    mimeType,
    originalName,
}: {
    serverId: string;
    fileBuffer: Buffer;
    mimeType: string;
    originalName?: string;
}): Promise<string> {
    if (!awsBucket) {
        throw new AppError('AWS S3 is not configured', 500, 'AWS_S3_NOT_CONFIGURED');
    }

    const extension = extensionByMimeType[mimeType] || 'bin';
    const uniqueSuffix = crypto.randomUUID();
    const safeName = (originalName || 'emoji')
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .slice(0, 60);
    const keyPrefix = process.env.AWS_S3_EMOJI_PREFIX || 'emojis';
    const objectKey = `${keyPrefix}/${serverId}-${safeName}-${uniqueSuffix}.${extension}`;

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: awsBucket,
            Key: objectKey,
            Body: fileBuffer,
            ContentType: mimeType,
        }));
    } catch (error) {
        console.error('[ERROR] Failed uploading emoji to S3', error);
        throw new AppError('Failed to upload emoji', 502, 'S3_UPLOAD_FAILED');
    }

    const normalizedEndpoint = s3Endpoint.endsWith('/') ? s3Endpoint.slice(0, -1) : s3Endpoint;
    return `${normalizedEndpoint}/${awsBucket}/${objectKey}`;
}

async function uploadEmojiFileToS3(serverId: string, absoluteFilePath: string): Promise<string> {
    const fileBuffer = await readFile(absoluteFilePath);
    const fileName = basename(absoluteFilePath).toLowerCase();

    let mimeType = 'application/octet-stream';
    if (fileName.endsWith('.png')) {
        mimeType = 'image/png';
    } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
    } else if (fileName.endsWith('.webp')) {
        mimeType = 'image/webp';
    } else if (fileName.endsWith('.gif')) {
        mimeType = 'image/gif';
    }

    return uploadEmojiToS3({
        serverId,
        fileBuffer,
        mimeType,
        originalName: basename(absoluteFilePath),
    });
}

export {
    uploadAvatarToS3,
    uploadIconToS3,
    uploadEmojiToS3,
    uploadEmojiFileToS3,
};
