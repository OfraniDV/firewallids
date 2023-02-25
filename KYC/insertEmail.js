const { pool } = require('../psql/db');

async function insertEmail(userId, email) {
  const query = {
    text: 'UPDATE kycfirewallids SET email=$2 WHERE user_id=$1',
    values: [userId, email],
  };

  try {
    await pool.query(query);
    console.log('Email insertado correctamente!');
  } catch (err) {
    console.error('Error insertando email:', err.message);
  }
}

module.exports = {
  insertEmail,
};
