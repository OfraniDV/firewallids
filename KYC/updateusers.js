const { pool } = require('../psql/db');

async function updateUsers() {
  try {
    const result = await pool.query(`
      SELECT k.user_id, u.id FROM kycfirewallids k 
      LEFT JOIN usuarios u ON k.user_id = u.id
      WHERE k.approved = true
    `);

    for (const row of result.rows) {
      const userId = row.id;
      const kycUserId = row.user_id;

      if (userId) {
        const updateResult = await pool.query(`
          UPDATE usuarios SET tyc_aceptadas = true, ctc = true, verificado = true 
          WHERE id = $1 RETURNING *
        `, [userId]);

        console.log(`Usuario con ID ${userId} actualizado.`);
      } else {
        console.log(`No se encontró ningún usuario con ID ${kycUserId}.`);
      }
    }
  } catch (err) {
    console.error(`Error al actualizar los usuarios: ${err}`);
    throw err;
  }
}

module.exports = { updateUsers };
