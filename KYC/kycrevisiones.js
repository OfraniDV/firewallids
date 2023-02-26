const { Telegraf, Markup } = require('telegraf');
const { Pool } = require('pg');
const { getUserResponses } = require('./kycrespuestas');
const { generateReport } = require('./kycreporte');

const bot = new Telegraf(process.env.BOT_TOKEN);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

bot.action('enviarRevisiones', async (ctx) => {
  const userId = BigInt(ctx.message.text.match(/ID de usuario: (\d+)/)[1]);

  // Comprobar que todas las respuestas estén completas
  const responses = await getUserResponses(userId);
  let isComplete = true;
  let incompleteQuestions = '';
  for (const response of responses) {
    if (!response.answer) {
      isComplete = false;
      incompleteQuestions += `*${response.question}*\n`;
    }
  }

  if (!isComplete) {
    const message = `Lo siento, no se pueden enviar las revisiones ya que faltan las siguientes respuestas:\n\n${incompleteQuestions}`;
    return ctx.replyWithMarkdown(message);
  }

  // Generar el reporte y enviarlo al grupo de verificación KYC
  try {
    await generateReport(ctx, userId);
    const reportMessage = `El usuario de ID ${userId} ha enviado sus respuestas del KYC para revisión. Por favor, revisa el grupo de verificación KYC para procesar la solicitud.`;
    await ctx.reply(reportMessage);

    // Notificar al grupo de administradores
    const adminMessage = `El usuario de ID ${userId} ha enviado sus respuestas del KYC para revisión. Por favor, revisa el grupo de verificación KYC para procesar la solicitud.\n\n`;
    adminMessage += responses.map((response) => `*${response.question}:* ${response.answer}`).join('\n');
    await bot.telegram.sendMessage(process.env.ID_GROUP_ADMINS, adminMessage, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(`Error generando el reporte KYC: ${err.message}`);
    await ctx.reply('Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
  }
});

module.exports = { generateReport, getUserResponses };
