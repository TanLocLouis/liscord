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

type ServerMemberRow = RowDataPacket & {
	user_id: string;
};

type InviteRow = RowDataPacket & {
	code: string;
	server_id: string;
	max_uses: number | null;
	uses: number;
	expires_at: Date | null;
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
		const firstRow = rows[0] as { count?: number } | undefined;
		return firstRow?.count ?? 0;
	},
	async isServerOwner(serverId: string, userId: string): Promise<boolean> {
		const [rows] = await pool.execute<RowDataPacket[]>(
			`SELECT 1 AS is_owner FROM servers WHERE server_id = ? AND owner_id = ?`,
			[serverId, userId]
		);
		return rows.length > 0;
	},
	async isServerMember(serverId: string, userId: string): Promise<boolean> {
		const [rows] = await pool.execute<ServerMemberRow[]>(
			`SELECT user_id FROM server_members WHERE server_id = ? AND user_id = ? LIMIT 1`,
			[serverId, userId]
		);

		return rows.length > 0;
	},
	async createInvite(payload: {
		inviteId: string;
		code: string;
		serverId: string;
		createdBy: string;
		maxUses: number | null;
		expiresAt: Date | null;
	}): Promise<ResultSetHeader> {
		const [result] = await pool.execute<ResultSetHeader>(
			`INSERT INTO invites (invites_id, code, server_id, created_by, max_uses, expires_at)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			[payload.inviteId, payload.code, payload.serverId, payload.createdBy, payload.maxUses, payload.expiresAt]
		);

		return result;
	},
	async getInviteByCode(code: string): Promise<InviteRow | null> {
		const [rows] = await pool.execute<InviteRow[]>(
			`SELECT code, server_id, max_uses, uses, expires_at
			 FROM invites
			 WHERE code = ?
			 LIMIT 1`,
			[code]
		);

		if (rows.length === 0) {
			return null;
		}

		return rows[0] ?? null;
	},
	async joinServerByInviteCode(code: string, userId: string): Promise<{ serverId: string; joined: boolean }> {
		const conn = await pool.getConnection();

		try {
			await conn.beginTransaction();

			const [inviteRows] = await conn.execute<InviteRow[]>(
				`SELECT code, server_id, max_uses, uses, expires_at
				 FROM invites
				 WHERE code = ?
				 FOR UPDATE`,
				[code]
			);

			if (inviteRows.length === 0) {
				throw new Error('INVITE_NOT_FOUND');
			}

			const invite = inviteRows[0];
			if (!invite) {
				throw new Error('INVITE_NOT_FOUND');
			}

			if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
				throw new Error('INVITE_EXPIRED');
			}

			if (invite.max_uses !== null && invite.uses >= invite.max_uses) {
				throw new Error('INVITE_MAX_USES_REACHED');
			}

			const [memberRows] = await conn.execute<ServerMemberRow[]>(
				`SELECT user_id FROM server_members WHERE server_id = ? AND user_id = ? LIMIT 1`,
				[invite.server_id, userId]
			);

			const isMemberAlready = memberRows.length > 0;

			if (!isMemberAlready) {
				await conn.execute<ResultSetHeader>(
					`INSERT INTO server_members (server_id, user_id) VALUES (?, ?)`,
					[invite.server_id, userId]
				);

				await conn.execute<ResultSetHeader>(
					`UPDATE servers SET members_count = members_count + 1 WHERE server_id = ?`,
					[invite.server_id]
				);

				await conn.execute<ResultSetHeader>(
					`UPDATE invites SET uses = uses + 1 WHERE code = ?`,
					[code]
				);
			}

			await conn.commit();

			return { serverId: invite.server_id, joined: !isMemberAlready };
		} catch (error) {
			await conn.rollback();
			throw error;
		} finally {
			conn.release();
		}
	}
};

export default serverModel;
