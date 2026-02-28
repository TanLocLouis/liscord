import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MySQL
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
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