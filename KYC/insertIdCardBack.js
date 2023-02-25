const { pool } = require('../psql/db');

async function insertIdCardBack(userId, url) {
  const query = {
    text: 'UPDATE kycfirewallids SET id_card_back = $2 WHERE user_id = $1',
    values: [userId, url],
  };

  try {
    await pool.query(query);
    console.log(`La imagen del dorso de la cédula para el usuario con ID ${userId} ha sido agregada correctamente.`);
  } catch (err) {
    console.error('Error insertando imagen del dorso de la cédula:', err.message);
  }
}

module.exports = { insertIdCardBack };
