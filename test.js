const { insertKycData } = require('./tablakyc');
const fs = require('fs');

async function handleKycNombre(ctx) {
  const userId = BigInt(ctx.from.id);
  const name = ctx.message.text.toString();

  try {
    await insertKycData(userId, { name });
    await ctx.reply('¡Gracias por proporcionar tu nombre!');
  } catch (err) {
    console.error('Error insertando datos KYC:', err.message);
    await ctx.reply('Lo siento, ha habido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.');

    // Registra el error en un archivo de registro de errores
    const errorMsg = `${new Date().toISOString()} - Error insertando datos KYC: ${err.message}\n`;
    fs.appendFileSync('error.log', errorMsg);
  }
}


module.exports = {
  handleKycNombre,
};