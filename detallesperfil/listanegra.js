const { pool } = require('../psql/db');

const emoji = '🚷'; // Define el emoji a utilizar en los mensajes

async function checkListanegra(userID) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM listanegra WHERE id = $1', [userID]);
    if (result.rows.length > 0) {
      const motivo = result.rows[0].motivo;
      return `Este usuario está en la Lista Negra por el motivo siguiente: ${motivo} ${emoji}`;
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
