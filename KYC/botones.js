// Estos botones los pienso usar en el futuro

/*bot.action('enviarRevisiones', async (ctx) => {
    const userId = ctx.from.id;
  
    try {
      const responses = await getUserResponses(userId);
      console.log('responses:', responses);
      const reportMsg = `📝 *Solicitud de verificación de KYC*\n\n` +
        `Fecha: ${new Date().toLocaleString('es-CU', { timeZone: 'America/Havana' })}\n\n` +
        `El usuario de alias @${ctx.from.username} y ID ${userId} solicita que se revise su KYC:\n\n` +
        `${responses.map(response => `${response.question}: ${response.answer}`).join('\n')}\n\n`;
  
      const photos = responses.filter(response => response.answer.photoData);
  
      const buttons = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `Aceptar KYC para el usuario ${userId} 👍`,
                callback_data: `aprobarkyc:${userId}`
              },
              {
                text: `Rechazar KYC para el usuario ${userId} 👎`,
                callback_data: `rechazarkyc:${userId}`
              }
            ]
          ]
        }
      };
  
      await bot.telegram.sendMessage(ID_GROUP_VERIFY_KYC, reportMsg, { parse_mode: 'Markdown', ...buttons });
  
      for (const { question, answer } of photos) {
        const photoStream = answer.photoData;
        const photoFilename = answer.photoName;
  
        await bot.telegram.sendPhoto(ID_GROUP_VERIFY_KYC, { source: photoStream }, { caption: `${question}:` });
  
        // sleep to avoid exceeding the API rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
  
        // Delete the photo file after sending it
        fs.unlinkSync(photoFilename);
      }
  
    } catch (err) {
      console.error(`Error generando el reporte KYC: ${err.message}`);
      await ctx.reply('Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }
  });
  */