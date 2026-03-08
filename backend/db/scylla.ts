import { Client } from 'cassandra-driver';
import dotenv from 'dotenv';

dotenv.config();

const scyllaPort = Number(process.env.SCYLLA_PORT ?? 9042);
const contactPoints = (process.env.SCYLLA_CONTACT_POINTS ?? '127.0.0.1')
	.split(',')
	.map(point => point.trim())
	.filter(Boolean);

const client = new Client({
	contactPoints,
	localDataCenter: process.env.SCYLLA_DATACENTER || 'datacenter1',
	// keyspace: process.env.SCYLLA_KEYSPACE || 'liscord',
	protocolOptions: {
		port: Number.isNaN(scyllaPort) ? 9042 : scyllaPort,
	},
	...(process.env.SCYLLA_USERNAME
		? {
			credentials: {
				username: process.env.SCYLLA_USERNAME,
				password: process.env.SCYLLA_PASSWORD || '',
			},
		}
		: {}),
});

// Test the connection
client.connect()
	.then(() => {
		console.log('[STATUS] Connected to ScyllaDB');
	})
	.catch(err => console.error('[ERROR] Failed to connect to ScyllaDB', err));

export default client;
