const { insertKycData } = require('./tablakyc');

async function handleKycCI(ctx) {
  const userId = BigInt(ctx.from.id);
  const identityNumber = ctx.message.text.replace('/numeroci', '').trim();

  try {
    await insertKycData(userId, { identity_number: identityNumber });
    await ctx.reply('¡Gracias por proporcionar tu número de carnet de identidad!');
    await ctx.reply('¿Cuál es tu número de teléfono?', { reply_markup: { remove_keyboard: true } });
  } catch (err) {
    console.error('Error insertando datos KYC:', err.message);
    await ctx.reply('Lo siento, ha habido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.');
  }
}

module.exports = {
  handleKycCI,
};
