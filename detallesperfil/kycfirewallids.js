const { pool } = require('../psql/db');

const emoji = '✅'; // Define el emoji a utilizar en los mensajes

async function checkFirewallids(userID) {
  const client = await pool.connect();
  try {
    // Verificar si el usuario está verificado en Firewallids y aprobado
    const result = await client.query('SELECT * FROM kycfirewallids WHERE user_id = $1 AND approved = true', [userID]);

    // Si se encuentra el usuario en Firewallids y está aprobado
    if (result.rows.length > 0) {
      return `Este usuario está verificado en el bot Firewallids ${emoji}`;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error al buscar usuario en Firewallids:', err);
    return null;
  } finally {
    client.release();
  }
}

module.exports = { checkFirewallids };
