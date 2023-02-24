const { pool } = require('../psql/db');
const { updateKycName } = require('../kyc2/tablakyc');

const { Markup } = require('telegraf');

async function mostrarNombreCompleto(ctx, bot) {
  const nombreUsuario = ctx.from.first_name;
  const pregunta = '¿Cuál es tu nombre completo?';

  await ctx.reply(`Hola ${nombreUsuario}! ${pregunta}`, Markup.removeKeyboard());

  bot.on('text', async (ctx) => {
    const nombreCompleto = ctx.message.text;
    const user_id = BigInt(ctx.from.id); // Convertir el id del usuario a un número entero de 64 bits

    try {
      await pool.query('UPDATE kycfirewallids SET name = $1, user_id = $2 WHERE user_id = $2', [nombreCompleto, user_id]);
      console.log('UPDATE realizado con éxito');
    } catch (err) {
      console.error('Error actualizando nombre y user_id en la tabla:', err.message);
      console.log(err);
    }

    await ctx.telegram.sendMessage(ctx.from.id, '¡Gracias por proporcionar tu nombre completo!');

    // Aquí llamarías a la siguiente pregunta
  });
}

module.exports = {
  mostrarNombreCompleto
};
