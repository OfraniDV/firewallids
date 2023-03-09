const { pool } = require('../psql/db');


const emoji = '✅'; // Define el emoji a utilizar en los mensajes

async function checkIdentidad(userID) {
  const client = await pool.connect();
  try {
    // Verificar si el usuario está registrado y verificado
    const result = await client.query('SELECT * FROM usuarios WHERE id = $1 AND verificado = true AND tyc_aceptadas = true AND ctc = true', [userID]);

    // Si se encuentra el usuario y cumple con los requisitos, devolver mensaje de verificación
    if (result.rows.length > 0) {
      return `Este usuario está verificado en el Bot Reputacion Plus, ha realizado su KYC ${emoji}`;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error al buscar usuario en identidades:', err);
    return null;
  } finally {
    client.release();
  }
}

module.exports = { checkIdentidad };
