const mysql = require('mysql2');
const path = require('path');

const env = process.env.NODE_ENV;

let envFile;

if (env === 'development') {
  envFile = '.env.dev';
} else if (env === 'prod' || env === 'production') {
  envFile = '.env.production';
} else {
  envFile = '.env.staging';
}

require('dotenv').config({ path: path.resolve(__dirname, '../../', envFile) });

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'idender_stage',
    waitForConnections: true,
    port: 3306,
})

db.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        db.connect((err) => {
            if (err) {
                console.error('Error reconnecting to the database:', err);
            } else {
                console.log('Reconnected to the database');
            }
        });
    }
})

module.exports = db;