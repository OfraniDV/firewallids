const { Markup } = require('telegraf');
const { insertKycData } = require('./tablakyc');

async function handleKycNombre(ctx) {
  const userId = BigInt(ctx.from.id);
  const name = ctx.message.text.trim();

  try {
    await insertKycData(userId, { name: name });
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🆔 Numero del CI',
              callback_data: 'NumeroCi'
            }
          ]
        ]
      }
    };
    await ctx.reply(`¡Gracias por proporcionar su nombre, ${name}! Por favor, toque el botón a continuación y siga las instrucciones.`, options);
  } catch (err) {
    console.error('Error insertando datos KYC:', err.message);
    await ctx.reply('Lo siento, ha habido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.');
  }
}

module.exports = {
  handleKycNombre,
};
