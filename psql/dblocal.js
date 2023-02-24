const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USERlocal,
  password: process.env.DB_PASSWORDlocal,
  host: process.env.DB_URLlocal,
  database: process.env.DB_NAMElocal,
  
});

module.exports = {
  pool
};