const { pool } = require('../psql/db');
const { md, escapeMarkdown } = require('telegram-escape');

// Comando para elegir candidatos
async function elegirCommand(ctx) {
  try {
    const query = `SELECT * FROM candidatos ORDER BY id ASC`;
    const res = await pool.query(query);
    const candidatos = res.rows;

    if (candidatos.length === 0) {
      ctx.reply('No hay candidatos disponibles');
      return;
    }

    // Encabezado y emojis
    const encabezado = '¡Hora de elegir al Vice del CEO! 🗳️👨‍💼';
    const opciones = candidatos
      .filter((c) => c.vice_ceo === true)
      .map((c, i) => {
        const text = md`${i + 1}. ${escapeMarkdown(c.nombre)}`;
        return { text, callback_data: c.id };
      });

    const mensaje = `${encabezado}\n\nEstos son los candidatos:\n`;
    ctx.reply(mensaje, { reply_markup: { inline_keyboard: [opciones] } });

  } catch (err) {
    console.error('Error al obtener candidatos:', err.message);
    ctx.reply('Ocurrió un error al obtener los candidatos');
  }
}

module.exports = {
  elegirCommand,
};
