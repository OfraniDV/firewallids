const { Markup } = require('telegraf');
const { pool } = require('../psql/db');

// Comando para votaciones
async function votacionCommand(ctx) {
  const query = 'SELECT activo FROM votacion ORDER BY id DESC LIMIT 1';
  const { rows } = await pool.query(query);

  if (rows.length > 0 && rows[0].activo) {
    const message = '🗳️ ¡Bienvenido a las votaciones! 🗳️\n\n¿Qué desea hacer?\n1. Postularse: Ejecute /postularme\n2. Elegir: Ejecute /elegir\n3. No quiere ser mas Candidato: /descandidatarme\n4. Cancelar: /cancelar para salir en cualquier momento';
    ctx.replyWithMarkdown(message);
  } else {
    ctx.reply('Lo siento, las votaciones no están disponibles en este momento.');
  }
}

// Comando para cancelar
function cancelarCommand(ctx) {
  ctx.reply('¡Hasta luego!');
}

module.exports = {
  votacionCommand,
  cancelarCommand,
};

