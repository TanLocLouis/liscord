import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
const uri = process.env.MONGO_DB_URL;
const client = new MongoClient(uri);
client.connect()
    .then(() => console.log('[STATUS] Connected to MongoDB'))
    .catch(err => console.error('[ERROR] Failed to connect to MongoDB', err));

export default client;