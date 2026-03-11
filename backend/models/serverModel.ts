import pool from '../db/db.js';
import type { ResultSetHeader } from 'mysql2';
import type { RowDataPacket } from 'mysql2';
import { join } from 'path';

export type CreateServerInput = {
	serverId: string;
	serverName: string;
	description: string;
	serverIcon: string;
	membersCount: number;
	ownerId: string;
	createdAt: string;
};

export type JoinedServer = RowDataPacket & {
	server_id: string;
	server_name: string;
	description: string;
	server_icon: string;
	members_count: number;
	owner_id: string;
	created_at: string;
};

const serverModel = {
	async createServer(serverData: CreateServerInput): Promise<ResultSetHeader> {
		const [result] = await pool.execute<ResultSetHeader>(
			`INSERT INTO servers (
				server_id,
				server_name,
				description,
				server_icon,
				members_count,
				owner_id,
				created_at
			) VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				serverData.serverId,
				serverData.serverName,
				serverData.description,
				serverData.serverIcon,
				serverData.membersCount,
				serverData.ownerId,
				serverData.createdAt,
			]
		);

		return result;
	},
	async createServerMember(serverId: string, userId: string): Promise<ResultSetHeader> {
		const [result] = await pool.execute<ResultSetHeader>(
			`INSERT INTO server_members (server_id, user_id) VALUES (?, ?)`,
			[serverId, userId]
		);
		return result;
	},
	async getJoinedServersByUserId(userId: string): Promise<JoinedServer[]> {
		const [rows] = await pool.execute<JoinedServer[]>(
			`SELECT
				s.server_id,
				s.server_name,
				s.description,
				s.server_icon,
				s.members_count,
				s.owner_id,
				s.created_at
			FROM server_members sm
			INNER JOIN servers s ON sm.server_id = s.server_id
			WHERE sm.user_id = ?
			ORDER BY s.created_at DESC`,
			[userId]
		);

		return rows;
	},
	async joinServer(serverId: string, userId: string): Promise<ResultSetHeader> {
		const [result] = await pool.execute<ResultSetHeader>(
			`INSERT INTO server_members (server_id, user_id) VALUES (?, ?)`,
			[serverId, userId]
		);
		return result;
	},
	async getUserCreatedServersCount(userId: string): Promise<number> {
		const [rows] = await pool.execute<RowDataPacket[]>(
			`SELECT COUNT(*) AS count FROM servers WHERE owner_id = ?`,
			[userId]
		);
		return rows[0].count;
	},
	async isServerOwner(serverId: string, userId: string): Promise<boolean> {
		const [rows] = await pool.execute<RowDataPacket[]>(
			`SELECT 1 AS is_owner FROM servers WHERE server_id = ? AND owner_id = ?`,
			[serverId, userId]
		);
		return rows.length > 0;
	}
};

export default serverModel;
