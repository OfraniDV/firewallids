const { insertKycData } = require('../kyc2/tablakyc');
const { Markup } = require('telegraf');
const bot = require('../bot');

async function mostrarNombreCompleto(ctx) {
  const nombreUsuario = ctx.from.first_name;
  const pregunta = '¿Cuál es tu nombre completo?';

  await ctx.reply(`Hola ${nombreUsuario}! ${pregunta}`, Markup.removeKeyboard());

  bot.hears(/.*/, async (ctx) => {
    const nombreCompleto = ctx.message.text;
    const user_id = ctx.from.id;

    try {
      await insertKycData(user_id, nombreCompleto);
    } catch (err) {
      console.error('Error insertando datos KYC en la tabla:', err.message);
    }

    await ctx.reply('¡Gracias por proporcionar tu nombre completo!');

    // Aquí llamarías a la siguiente pregunta
  });
}

module.exports = {
  mostrarNombreCompleto
};
