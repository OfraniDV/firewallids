const { pool } = require('../psql/db');

// Insertar el número de identidad del usuario en la tabla KYC
async function insertIdentityNumber(userId, identityNumber) {
  const query = {
    text: 'UPDATE kycfirewallids SET identity_number = $1 WHERE user_id = $2',
    values: [identityNumber, userId],
  };

  try {
    await pool.query(query);
    console.log(`Número de identidad ${identityNumber} insertado para el usuario ${userId}`);
  } catch (err) {
    console.error(`Error insertando el número de identidad para el usuario ${userId}:`, err.message);
  }
}

module.exports = {
  insertIdentityNumber,
};
