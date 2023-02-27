bot.action('enviarRevisiones', async (ctx) => {
    const userId = ctx.from.id;
  
    try {
      const responses = await getUserResponses(userId);
      console.log('responses:', responses);
      const reportMsg = `📝 *Solicitud de verificación de KYC*\n\n` +
        `Fecha: ${new Date().toLocaleString('es-CU', { timeZone: 'America/Havana' })}\n\n` +
        `El usuario de alias @${ctx.from.username} y ID ${userId} solicita que se revise su KYC:\n\n` +
        `${responses.map(response => `${response.question}: ${response.answer}`).join('\n')}\n\n`;
  
      const photos = responses.filter(response => response.answer.photoData);
  
      await bot.telegram.sendMessage(ID_GROUP_VERIFY_KYC, reportMsg, { parse_mode: 'Markdown' });
  
      for (const { question, answer } of photos) {
        const photoStream = answer.photoData;
        const photoFilename = answer.photoName;
  
        await bot.telegram.sendPhoto(ID_GROUP_VERIFY_KYC, { source: photoStream }, { caption: `${question}:` });
  
        // sleep to avoid exceeding the API rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
  
        // Delete the photo file after sending it
        fs.unlinkSync(photoFilename);
      }
  
      // Mensaje para explicar cómo aprobar/rechazar KYC
      const instructionsMsg = `Para *aprobar* el KYC, escribe:\n\n/aprobarkyc ${userId}\n\nPara *rechazar* el KYC, escribe:\n\n/rechazarkyc ${userId}`;
      await bot.telegram.sendMessage(ID_GROUP_VERIFY_KYC, instructionsMsg, { parse_mode: 'Markdown' });
  
    } catch (err) {
      console.error(`Error generando el reporte KYC: ${err.message}`);
      await ctx.reply('Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }
  });

  
  ///segunda version

  bot.command('aprobarkyc', async (ctx) => {
    const kycId = ctx.message.text.split(' ')[1];
  
    const isAdmin = await checkAdmin(ctx.from.id);
  
    if (!isAdmin) {
      await ctx.reply('Lo siento, solo los administradores pueden aprobar KYCs.');
      return;
    }
  
    try {
      const kycData = await getKYCData(kycId);
  
      if (!kycData) {
        await ctx.reply(`No se pudo encontrar la solicitud de KYC con ID ${kycId}`);
        return;
      }
  
      const approvedBy = ctx.from.id;
  
      await approveKYC(kycId, approvedBy);
  
      const reportMsg = `✅ *KYC aprobado*\n\n` +
        `La solicitud de KYC con ID ${kycId} ha sido aprobada por el administrador de alias @${ctx.from.username} y ID ${approvedBy}.\n\n` +
        `Los datos del usuario son los siguientes:\n\n` +
        `${kycData.map(response => `${response.question}: ${response.answer}`).join('\n')}\n\n`;
  
      const photos = kycData.filter(response => response.answer.photoData);
  
      await bot.telegram.sendMessage(ID_GROUP_VERIFY_KYC, reportMsg, { parse_mode: 'Markdown' });
  
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
      console.error(`Error aprobando KYC: ${err.message}`);
      await ctx.reply('Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }
  });
  
  async function checkAdmin(userId) {
    const result = await pool.query('SELECT id FROM listanegra_administradores WHERE id = $1', [userId]);
    return result.rows.length > 0;
  }
  