const { pool } = require('../psql/db');
const { md, escapeMarkdown } = require('telegram-escape');

// Comando para elegir candidatos
async function elegirCommand(ctx) {
  try {
    // Verificar si la tabla elegidos existe, sino crearla
    const createElegidosTable = `
      CREATE TABLE IF NOT EXISTS elegidos (
        id_elector INTEGER,
        id_candidato INTEGER,
        UNIQUE (id_elector)
      )
    `;
    await pool.query(createElegidosTable);

    const query = `SELECT * FROM candidatos ORDER BY id ASC`;
    const res = await pool.query(query);
    const candidatos = res.rows;

    if (candidatos.length === 0) {
      ctx.reply('No hay candidatos disponibles');
      return;
    }

    // Encabezado y emojis
    const encabezado = '¡Hora de elegir al Vice del CEO! 🗳️👨‍💼';
    const candidatosHtml = candidatos
      .filter((c) => c.vice_ceo === true)
      .map((c, i) => {
        const text = md`${i + 1}. ${escapeMarkdown(c.nombre)} ${c.emoji}`;
        const callbackData = c.id.toString();
        return `<a href="tg://callback_query?data=${callbackData}">${text}</a>`;
      })
      .join('\n');

    const mensaje = `${encabezado}\n\nEstos son los candidatos:\n\n${candidatosHtml}\n\nPor favor haga clic en el nombre del candidato que desee elegir.`;
    ctx.replyWithHTML(mensaje);

    // Escuchar por la elección del usuario
    const candidatoIds = candidatos
      .filter((c) => c.vice_ceo === true)
      .map((c) => c.id);

    ctx.on('callback_query', async (elegirCtx) => {
      const userId = elegirCtx.from.id;
      const candidatoId = Number.parseInt(elegirCtx.callbackQuery.data);

      if (!candidatoIds.includes(candidatoId)) {
        elegirCtx.answerCbQuery('Este candidato no está disponible');
        return;
      }

      try {
        const query = `INSERT INTO elegidos (id_elector, id_candidato) VALUES ($1, $2)`;
        const values = [userId, candidatoId];
        await pool.query(query, values);

        const candidato = candidatos.find((c) => c.id === candidatoId);
        const mensaje = `Usted ha elegido a ${candidato.nombre} como candidato a Vice del CEO 🎉`;
        elegirCtx.reply(mensaje);
      } catch (err) {
        console.error('Error al guardar elección del usuario:', err.stack);
        elegirCtx.reply('Ha ocurrido un error al registrar su elección. Por favor inténtelo de nuevo.');
      }
    });

  } catch (err) {
    console.error('Error al obtener candidatos:', err.message);
    ctx.reply('Ocurrió un error al obtener los candidatos');
  }
}

module.exports = {
  elegirCommand,
};
