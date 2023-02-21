const { pool } = require('../psql/db');
const { md, escapeMarkdown } = require('telegram-escape');
const { Markup } = require('telegraf');

const admines = {
  async listarAdmines(bot) {
    try {
      // Consultar la tabla de admines
      const query = 'SELECT id FROM listanegra_administradores ORDER BY id';
      const res = await pool.query(query);
      const admines = res.rows;

      if (admines.length === 0) {
        bot.reply('Aún no hay admines registrados.');
        return;
      }

      // Construir los botones de los admines
      const botones = await Promise.all(admines.map(async admin => {
        const nombre = await ctx.telegram.getChat(admin.id).then(chat => chat.first_name);
        const texto = escapeMarkdown(nombre);
        return Markup.button.callback(texto, `admin_${admin.id}`);
      }));

      // Dividir los botones en grupos de dos
      const gruposBotones = [];
      let i = 0;
      while (i < botones.length) {
        const grupo = botones.slice(i, i + 2);
        gruposBotones.push(grupo);
        i += 2;
      }

      // Agregar un botón de "Cancelar"
      gruposBotones.push([Markup.button.callback('Cancelar', 'cancelar')]);

      // Enviar el mensaje con los botones
      const mensaje = 'Estos son los admines registrados:';
      bot.replyWithMarkdown(mensaje, Markup.inlineKeyboard(gruposBotones));
    } catch (err) {
      console.error('Error al listar los admines:', err);
      bot.reply('Ha ocurrido un error al listar los admines. Por favor inténtelo de nuevo.');
    }
  },

  async proponerCandidato(ctx) {
    try {
      const adminId = parseInt(ctx.match[0].split('_')[1]);

      // Consultar si el admin ya está en la tabla de candidatos
      const query = 'SELECT * FROM candidatos WHERE id = $1';
      const res = await pool.query(query, [adminId]);
      if (res.rows.length > 0) {
        ctx.answerCbQuery('Este admin ya ha sido propuesto como candidato.');
        return;
      }

      // Agregar al admin como candidato
      const nombreAdmin = await ctx.telegram.getChat(adminId).then(chat => chat.first_name);
      const query2 = 'INSERT INTO candidatos (id, nombre, vice_ceo, fecha) VALUES ($1, $2, $3, $4)';
      const hoy = new Date();
      const values = [adminId, nombreAdmin, false, hoy];
      await pool.query(query2, values);

      // Enviar mensaje de confirmación
      const mensaje = `El admin ${nombreAdmin} ha sido propuesto como candidato a Vice del CEO.`;
      ctx.answerCbQuery(mensaje);
    } catch (err) {
      console.error('Error al proponer un candidato:', err);
      ctx.answerCbQuery('Ha ocurrido un error al proponer un candidato. Por favor inténtelo de nuevo.');
    }
  },
};

module.exports = admines;
