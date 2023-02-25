const { pool } = require('../psql/db');

async function insertName(userId, name) {
  const query = {
    text: `UPDATE kycfirewallids SET name=$2 WHERE user_id=$1`,
    values: [userId, name],
  };

  try {
    await pool.query(query);
    console.log('Nombre insertado o actualizado correctamente!');
  } catch (err) {
    console.error('Error insertando o actualizando nombre:', err.message);
  }
}

module.exports = { insertName };
