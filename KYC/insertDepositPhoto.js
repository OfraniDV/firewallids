const { pool } = require('../psql/db');

async function insertDepositPhoto(userId, photoUrl) {
  const query = {
    text: `UPDATE kycfirewallids SET deposit_photo=$2 WHERE user_id=$1`,
    values: [userId, photoUrl],
  };

  try {
    await pool.query(query);
    console.log('Foto del depósito insertada correctamente!');
  } catch (err) {
    console.error('Error insertando foto del depósito:', err.message);
  }
}

module.exports = {
  insertDepositPhoto,
};
