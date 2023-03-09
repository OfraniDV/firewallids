const { pool } = require('../psql/db');

const emoji = '🛗'; // Define el emoji a utilizar en los mensajes

async function checkGruposComunes(userID) {
  const client = await pool.connect();
  try {
    // Verificar en cuántas filas aparece el usuario en la columna "usuario"
    const result = await client.query('SELECT COUNT(DISTINCT grupo) FROM monitorizacion_usuarios_grupos WHERE usuario = $1', [userID]);
    const count = parseInt(result.rows[0].count);

    // Si el usuario aparece en la tabla, devolver mensaje
    if (count > 0) {
      return `A este usuario ID lo he visto en un total de ${count} grupos en común con nosotros ${emoji}`;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error al buscar usuario en monitorizacion_usuarios_grupos:', err);
    return null;
  } finally {
    client.release();
  }
}

module.exports = { checkGruposComunes };

