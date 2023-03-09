const { pool } = require('../psql/db');

const emoji = '🥷'; // Define el emoji a utilizar en los mensajes

async function checkAdministrador(userID) {
  const client = await pool.connect();
  try {
    // Verificar si el usuario es un administrador
    const result = await client.query('SELECT * FROM listanegra_administradores WHERE id = $1', [userID]);

    // Si el usuario es un administrador, devolver mensaje
    if (result.rows.length > 0) {
      return `Este usuario es un Administrador del Sistema Reputacion Plus y Firewallids ${emoji}`;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error al buscar usuario en listanegra_administradores:', err);
    return null;
  } finally {
    client.release();
  }
}

module.exports = { checkAdministrador };
