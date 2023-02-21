const { pool } = require('../psql/db');
const { md, escapeMarkdown } = require('telegram-escape');

const elegir = {
  async elegirCommand(ctx, bot) {
    try {
      // Verificar si la tabla elegidos existe, sino crearla
      const createElegidosTable = `
        CREATE TABLE IF NOT EXISTS elegidos (
          id_elector BIGINT,
          id_candidato BIGINT,
          UNIQUE (id_elector)
        )
      `;
      await pool.query(createElegidosTable);

      const query = `SELECT * FROM candidatos WHERE vice_ceo = true ORDER BY id ASC`;
      const res = await pool.query(query);
      const candidatos = res.rows;

      if (candidatos.length === 0) {
        ctx.reply('Aún no hay candidatos disponibles para el puesto de Vice del CEO. Inténtelo más tarde.');
        return;
      }

      // Encabezado y emojis
const encabezado = '¡Hora de elegir al Vice del CEO! 🗳️👨‍💼\n\nEstos son los candidatos:\n';
const opciones = candidatos.map((c, i) => {
  const text = `👤 ${escapeMarkdown(c.nombre)}`;
  const newRow = i % 2 === 0 ? true : false;
  return { text, callback_data: c.id, newRow };
});

const gruposBotones = [[]];
let grupoActual = 0;

opciones.forEach((opcion) => {
  if (opcion.newRow) {
    grupoActual++;
    gruposBotones.push([]);
  }

  gruposBotones[grupoActual].push({ text: opcion.text, callback_data: opcion.callback_data });
});

const replyMarkup = {
  inline_keyboard: gruposBotones,
};

ctx.reply(encabezado, { reply_markup: replyMarkup });

      // Escuchar por la elección del usuario
      const candidatoIds = candidatos.map((c) => c.id);

      bot.on('callback_query', async (ctx) => {
        const userId = ctx.from.id;
        const candidatoId = Number.parseInt(ctx.callbackQuery.data);

        if (!candidatoIds.includes(candidatoId)) {
          return;
        }

        try {
          const query = `INSERT INTO elegidos (id_elector, id_candidato) VALUES ($1, $2)`;
          const values = [userId, candidatoId];
          await pool.query(query, values);

          const candidato = candidatos.find((c) => c.id === candidatoId);
          const mensaje = `🎉 ¡Enhorabuena! Has elegido a ${candidato.nombre} como candidato a Vice del CEO.\n\nPuedes volver al menú principal de votación con el comando /votacion.\n\nSi necesitas ayuda, utiliza el comando /ayuda.`;
          await ctx.reply(mensaje);
        } catch (err) {
          console.error('Error al guardar elección del usuario:', err);
          await ctx.reply('Ha ocurrido un error al registrar su elección. Por favor inténtelo de nuevo.');
        }
      });
    } catch (err) {
      console.error
('Error al procesar el comando:', err);
      await ctx.reply('Ha ocurrido un error al procesar su solicitud. Por favor inténtelo de nuevo.');
    }
  },
};

module.exports = elegir;