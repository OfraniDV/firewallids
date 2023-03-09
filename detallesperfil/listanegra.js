const { pool } = require('../psql/db');

async function checkListanegra(userID) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM listanegra WHERE id = $1', [userID]);
    if (result.rows.length > 0) {
      const motivo = result.rows[0].motivos;
      return `Este usuario está en la Lista Negra por el siguiente motivo: ${motivo}`;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error al buscar usuario en la lista negra:', err);
    return null;
  } finally {
    client.release();
  }
}

module.exports = { checkListanegra };
