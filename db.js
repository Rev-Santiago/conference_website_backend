import dotenv from "dotenv"; // Load env variables
dotenv.config();

import mysql from "mysql2";
import process from "process";

// Create MySQL Connection Pool (Recommended for scalability)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10, // Limits the number of connections to 10
    queueLimit: 0
});

// Check Connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database Connection Failed:", err);
        process.exit(1); // Exit the process if the database fails to connect
    }
    console.log("✅ MySQL Database Connected");
    connection.release(); // Release the connection back to the pool
});

// Exporting promise-based pool for async/await support
const db = pool.promise();
export default db;
