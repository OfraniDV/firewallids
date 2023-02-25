const { insertKycData } = require('./tablakyc');

async function handleKycNombre(ctx) {
  const userId = BigInt(ctx.from.id);
  const name = ctx.message.text.replace('/kycnombre', '').trim();

  try {
    await insertKycData(userId, { name });
    await ctx.reply('¡Gracias por proporcionar tu nombre!');
  } catch (err) {
    console.error('Error insertando datos KYC:', err.message);
    await ctx.reply('Lo siento, ha habido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.');
  }
}

module.exports = {
  handleKycNombre,
};
