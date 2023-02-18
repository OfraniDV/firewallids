const { pool } = require('../psql/db');

async function verificarCambiosUsuarios(id) {
  try {
    // Realizar la consulta a la base de datos
    const query = {
      text: 'SELECT COUNT(*) FROM monitorizacion_usuarios WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);

    // Obtener el número de registros con el mismo ID
    const count = parseInt(result.rows[0].count);

    // Si existen varios registros con el mismo ID, significa que ha habido cambios de nombres
    if (count > 1) {
      console.log(`El usuario con ID ${id} ha cambiado de nombre`);
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = { verificarCambiosUsuarios };
