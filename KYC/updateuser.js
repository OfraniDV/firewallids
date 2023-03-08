require('dotenv').config();
const { pool } = require('../psql/db');

async function updateUser() {
  try {
    const result = await pool.query(
      `SELECT id FROM usuarios WHERE tyc_aceptadas = false OR ctc = false OR verificado = false`
    );

    console.log(`Actualizando usuarios para ${result.rows.length} usuarios...`);

    for (const row of result.rows) {
      const { id } = row;

      // Buscar si el usuario tiene el estado aprobado en la tabla identidades
      const identidades = await pool.query(
        `SELECT estado FROM identidades WHERE usuario_id = $1`,
        [id]
      );

      if (identidades.rows.length > 0 && identidades.rows[0].estado === 1) {
        const usuario = await pool.query(
          `SELECT tyc_aceptadas, ctc, verificado FROM usuarios WHERE id = $1`,
          [id]
        );

        const { tyc_aceptadas, ctc, verificado } = usuario.rows[0];

        // Actualizar la columna tyc_aceptadas en la tabla usuarios
        if (!tyc_aceptadas) {
          console.log(` - Actualizando tyc_aceptadas a true para el usuario con id ${id}`);
          await pool.query(
            `UPDATE usuarios SET tyc_aceptadas = true WHERE id = $1`,
            [id]
          );
        }

        // Actualizar la columna ctc en la tabla usuarios
        if (!ctc) {
          console.log(` - Actualizando ctc a true para el usuario con id ${id}`);
          await pool.query(
            `UPDATE usuarios SET ctc = true WHERE id = $1`,
            [id]
          );
        }

        // Actualizar la columna verificado en la tabla usuarios
        if (!verificado) {
          console.log(` - Actualizando verificado a true para el usuario con id ${id}`);
          await pool.query(
            `UPDATE usuarios SET verificado = true WHERE id = $1`,
            [id]
          );
        }
      }
    }

    console.log('Todos los usuarios han sido actualizados correctamente');
  } catch (err) {
    console.error(`Error al actualizar usuarios: ${err}`);
  }
}

updateUser();

module.exports = { updateUser };
