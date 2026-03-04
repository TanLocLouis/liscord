import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const mysqlPort = Number(process.env.MYSQL_PORT ?? 3306);

// Connect to MySQL
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number.isNaN(mysqlPort) ? 3306 : mysqlPort,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'liscord',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection()
    .then(conn => {
        console.log('[STATUS] Connected to MySQL');
        conn.release();
    })
    .catch(err => console.error('[ERROR] Failed to connect to MySQL', err));

export default pool;