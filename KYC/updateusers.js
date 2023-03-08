const { pool } = require('../psql/db');

async function updateUsers() {
  try {
    // Obtener los usuarios a actualizar
    const result = await pool.query(`
      SELECT k.user_id, u.id 
      FROM kycfirewallids k 
      LEFT JOIN usuarios u ON k.user_id = u.id
      WHERE k.approved = true
    `);

    let count = 0;

    // Actualizar usuarios
    for (const row of result.rows) {
      const userId = row.id;
      const kycUserId = row.user_id;

      if (userId) {
        // Verificar si es necesario actualizar el usuario
        const updateResult = await pool.query(`
          UPDATE usuarios 
          SET tyc_aceptadas = CASE WHEN tyc_aceptadas = false THEN true ELSE tyc_aceptadas END,
              ctc = CASE WHEN ctc = false THEN true ELSE ctc END,
              verificado = CASE WHEN verificado = false THEN true ELSE verificado END
          WHERE id = $1 AND (tyc_aceptadas = false OR ctc = false OR verificado = false) 
          RETURNING *
        `, [userId]);

        // Si se actualizó el usuario, aumentar el contador
        if (updateResult.rowCount > 0) {
          count++;
          console.log(`✔️ Usuario con ID ${userId} actualizado.`);
        } else {
          console.log(`✅ El usuario con ID ${userId} ya tenía las columnas en true. No se realizó ninguna actualización.`);
        }
      } else {
        console.log(`❌ No se encontró ningún usuario con ID ${kycUserId}.`);
      }
    }

    // Mostrar resumen de cambios
    if (count > 0) {
      console.log(`\n✨ Se actualizaron ${count} usuarios.`);
    } else {
      console.log('\n✨ No se realizaron cambios en los usuarios.');
    }
  } catch (err) {
    console.error(`❌ Error al actualizar los usuarios: ${err}`);
    throw err;
  }
}

module.exports = { updateUsers };
