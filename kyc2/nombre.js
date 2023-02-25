const { Markup } = require('telegraf');
const { insertKycData } = require('./tablakyc');
const bot = require('../bot');

async function mostrarNombreCompleto(ctx) {
  const nombreUsuario = ctx.from.first_name;
  const pregunta = '¿Cuál es tu nombre completo?';

  await ctx.reply(`Hola ${nombreUsuario}! ${pregunta}`, Markup.removeKeyboard());

  bot.hears(/.*/, async (ctx) => {
    const nombreCompleto = ctx.message.text;
    const userId = ctx.from.id;

    try {
      await insertKycData(userId, nombreCompleto);
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
