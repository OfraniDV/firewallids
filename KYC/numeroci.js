const { Markup } = require('telegraf');
const { insertKycData } = require('./tablakyc');

async function handleKycNumeroCi(ctx) {
  const userId = BigInt(ctx.from.id);
  const numeroCi = ctx.message.text.trim();

  try {
    await insertKycData(userId, { identity_number: numeroCi });
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📞 Telefono',
              callback_data: 'Telefono'
            }
          ]
        ]
      }
    };
    await ctx.reply('¡Gracias! Por favor, toque el botón a continuación y siga las instrucciones.', options);
  } catch (err) {
    console.error('Error actualizando datos KYC:', err.message);
    await ctx.reply('Lo siento, ha habido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.');
  }
}

module.exports = {
  handleKycNumeroCi,
};
