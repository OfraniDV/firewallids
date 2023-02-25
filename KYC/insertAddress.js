const { pool } = require('../psql/db');

async function insertAddress(userId, address) {
  const query = {
    text: 'UPDATE kycfirewallids SET address=$2 WHERE user_id=$1',
    values: [userId, address],
  };

  try {
    await pool.query(query);
    console.log('Dirección insertada correctamente!');
  } catch (err) {
    console.error('Error insertando dirección:', err.message);
  }
}

module.exports = {
  insertAddress,
};
