const { Markup } = require('telegraf');
const { getUserResponses } = require('./kycrespuestas');

async function generateReport(bot, ctx) {
  
  try {
    const responses = await getUserResponses(userId);
    const reportMsg = `*Estoy haciendo Test de Reportes de KYC*\n\n` +
      `Aquí se muestran las respuestas del usuario a las preguntas del KYC:\n\n` +
      `${responses.map(response => `${response.question}: ${response.answer}`).join('\n')}`;

    await bot.telegram.sendMessage(userId, reportMsg, { parse_mode: 'Markdown' });

  } catch (err) {
    console.error(`Error generando el reporte KYC: ${err.message}`);
    throw err;
  }
}

module.exports = {
  generateReport,
};
