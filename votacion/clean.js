const { pool } = require('../psql/db');

async function cleanCommand(ctx) {
  try {
    // Borrar registros de la tabla candidatos
    const deleteCandidatosTable = `DELETE FROM candidatos`;
    await pool.query(deleteCandidatosTable);

    // Borrar registros de la tabla elegidos
    const deleteElegidosTable = `DELETE FROM elegidos`;
    await pool.query(deleteElegidosTable);

    // Borrar registros de la tabla votacion
    const deleteVotacionTable = `DELETE FROM votacion`;
    await pool.query(deleteVotacionTable);

    ctx.reply('Se han eliminado todos los registros de la votación.');
  } catch (err) {
    console.error('Error al procesar el comando:', err);
    ctx.reply('Ha ocurrido un error al procesar su solicitud. Por favor inténtelo de nuevo.');
  }
}

module.exports = {
  cleanCommand,
};
