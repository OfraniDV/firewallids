const { pool } = require('../psql/db');

// Comando /votaciones para verificar si el usuario puede participar en la votación
async function votacionesCommand(ctx) {
  const userId = ctx.from.id;

  try {
    const staffQuery = await pool.query('SELECT id FROM staff WHERE id=$1', [userId]);
    const votacionQuery = await pool.query('SELECT activo FROM votacion WHERE activo=true');

    if (staffQuery.rows.length > 0) {
      if (votacionQuery.rows.length > 0) {
        ctx.reply('🗳️ Puedes participar en la votación.');
        // Aquí iría el código para mostrar el menú de votación




















































        






      } else {
        ctx.reply('🚨 Acceso denegado 🚨\n\nLo siento, el CEO aún no ha activado ninguna votación.');
      }
    } else {
      ctx.reply('🚨 Acceso denegado 🚨\n\nLo siento, no puedes participar en la votación.');
    }
  } catch (err) {
    console.log(err.stack);
    ctx.reply('Ha ocurrido un error al verificar la votación. Por favor inténtalo de nuevo más tarde.');
  }
}

module.exports = {
  votacionesCommand,
};
