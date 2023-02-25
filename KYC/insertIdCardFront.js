const { pool } = require('../psql/db');

async function insertIdCardFront(userId, idCardFront) {
  const query = {
    text: 'UPDATE kycfirewallids SET id_card_front=$2 WHERE user_id=$1',
    values: [userId, idCardFront],
  };

  try {
    await pool.query(query);
    console.log('Imagen del frente de la cédula insertada correctamente!');
  } catch (err) {
    console.error('Error insertando imagen del frente de la cédula:', err.message);
  }
}

module.exports = {
  insertIdCardFront,
};
