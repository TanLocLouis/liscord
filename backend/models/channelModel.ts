import pool from '../db/db.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import client from '../db/scylla.js';
import { rename } from 'node:fs';

export type CreateChannelInput = {
	channelId: string;
	channelName: string;
	type: 'text' | 'voice';
	position: number;
	serverId: string;
};

export type Channel = RowDataPacket & {
	channel_id: string;
	channel_name: string;
	type: 'text' | 'voice';
	position: number;
	created_at: string;
	server_id: string;
};

type MembershipRow = RowDataPacket & {
	has_access: number;
};

type NextPositionRow = RowDataPacket & {
	next_position: number;
};

const channelModel = {
	async createChannel(channelData: CreateChannelInput): Promise<ResultSetHeader> {
		const [result] = await pool.execute<ResultSetHeader>(
			`INSERT INTO channels (
				channel_id,
				channel_name,
				type,
				position,
				server_id
			) VALUES (?, ?, ?, ?, ?)`,
			[
				channelData.channelId,
				channelData.channelName,
				channelData.type,
				channelData.position,
				channelData.serverId,
			]
		);

		return result;
	},
	async getChannelById(channelId: string): Promise<Channel | null> {
		const [rows] = await pool.execute<Channel[]>(
			`SELECT
				channel_id,
				channel_name,
				type,
				position,
				created_at,
				server_id
			FROM channels
			WHERE channel_id = ?`,
			[channelId]
		);

		const [firstRow] = rows;
		return firstRow || null;
	},
	async getChannelsByServerId(serverId: string): Promise<Channel[]> {
		const [rows] = await pool.execute<Channel[]>(
			`SELECT
				channel_id,
				channel_name,
				type,
				position,
				created_at,
				server_id
			FROM channels
			WHERE server_id = ?
			ORDER BY position ASC, created_at ASC`,
			[serverId]
		);

		return rows;
	},
	async isServerMember(serverId: string, userId: string): Promise<boolean> {
		const [rows] = await pool.execute<MembershipRow[]>(
			`SELECT 1 AS has_access
			FROM server_members
			WHERE server_id = ? AND user_id = ?
			LIMIT 1`,
			[serverId, userId]
		);

		return rows.length > 0;
	},
	async getNextPosition(serverId: string): Promise<number> {
		const [rows] = await pool.execute<NextPositionRow[]>(
			`SELECT COALESCE(MAX(position), -1) + 1 AS next_position
			FROM channels
			WHERE server_id = ?`,
			[serverId]
		);

		const [firstRow] = rows;
		return firstRow?.next_position ?? 0;
	},
	async getChannelsPerServerCount(serverId: string): Promise<number> {
		const [rows] = await pool.execute<RowDataPacket[]>(
			`SELECT COUNT(*) AS channel_count
			FROM channels
			WHERE server_id = ?`,
			[serverId]
		);

		const [firstRow] = rows;
		return firstRow?.channel_count ?? 0;
	},
	async renameChannel(channelId: string, newName: string): Promise<ResultSetHeader> {
		const [result] = await pool.execute<ResultSetHeader>(
			`UPDATE channels
			SET channel_name = ?
			WHERE channel_id = ?`,
			[newName, channelId]
		);

		return result;
	},
	async deleteChannel(channelId: string): Promise<ResultSetHeader> {
		const [result] = await pool.execute<ResultSetHeader>(
			`DELETE FROM channels
			WHERE channel_id = ?`,
			[channelId]
		);

		return result;
	},
};

export default channelModel;
