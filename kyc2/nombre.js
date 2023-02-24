const { pool } = require('../psql/db');
const { updateKycName } = require('../kyc2/tablakyc');

const { Markup } = require('telegraf');

async function mostrarNombreCompleto(ctx, bot) {
  const nombreUsuario = ctx.from.first_name;
  const pregunta = '¿Cuál es tu nombre completo?';

  await ctx.reply(`Hola ${nombreUsuario}! ${pregunta}`, Markup.removeKeyboard());

  bot.on('text', async (ctx) => {
    const nombreCompleto = ctx.message.text;
    const user_id = ctx.from.id;

    try {
      await pool.query('UPDATE kycfirewallids SET name = $1 WHERE user_id = $2', [nombreCompleto, user_id]);
    } catch (err) {
      console.error('Error actualizando nombre en la tabla:', err.message);
      console.log(err);
    }
    

    await ctx.reply('¡Gracias por proporcionar tu nombre completo!');

    // Aquí llamarías a la siguiente pregunta
  });
}

module.exports = {
  mostrarNombreCompleto
};
