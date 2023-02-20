const { pool } = require('../psql/db');

async function descandidatarseCommand(ctx) {
  try {
    const userId = ctx.from.id;
    const query = `DELETE FROM candidatos WHERE id = $1`;
    const values = [userId];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      ctx.reply('Usted no estaba en la lista de candidatos.');
    } else {
      ctx.reply('Usted ha sido eliminado de la lista de candidatos.');
    }
  } catch (err) {
    console.error('Error al procesar el comando:', err);
    ctx.reply('Ha ocurrido un error al procesar su solicitud. Por favor inténtelo de nuevo.');
  }
}

module.exports = {
  descandidatarseCommand,
};
