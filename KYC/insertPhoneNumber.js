const { pool } = require('../psql/db');

async function insertPhoneNumber(userId, phoneNumber) {
  const query = {
    text: 'UPDATE kycfirewallids SET phone_number = $2 WHERE user_id = $1',
    values: [userId, phoneNumber],
  };

  try {
    await pool.query(query);
    console.log('Número de teléfono insertado o actualizado correctamente!');
  } catch (err) {
    console.error('Error insertando o actualizando número de teléfono:', err.message);
  }
}

module.exports = {
  insertPhoneNumber,
};
