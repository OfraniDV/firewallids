const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_URL,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  pool
};