bot.action('kyc', async (ctx) => {
    // Verifica si el bot贸n se est谩 ejecutando en el chat privado con el bot
    if (ctx.chat.type !== 'private') {
      // Si no es el chat privado con el bot, muestra un mensaje de acceso denegado
      await ctx.answerCbQuery('馃毇 Acceso denegado. Este bot贸n solo est谩 disponible en el chat privado con el bot');
      return;
    }
  
    // Obtiene el ID del usuario
    const userId = ctx.from.id;
  
    try {
      // Consulta si el usuario ya complet贸 el KYC en la tabla kycfirewallids
      const kycResult = await pool.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [userId]);
  
      if (kycResult.rows.length > 0) {
        // Si el usuario ya complet贸 el KYC, env铆a un mensaje indicando que ya complet贸 el proceso
        await ctx.answerCbQuery('Ya has completado el proceso KYC');
        return;
      }
  
      // Consulta si el usuario ya complet贸 el KYC en la tabla identidades
      const idResult = await pool.query('SELECT * FROM identidades WHERE usuario_id = $1', [userId]);
  
      if (idResult.rows.length > 0) {
        // Si el usuario ya complet贸 el KYC, env铆a un mensaje indicando que ya complet贸 el proceso
        await ctx.answerCbQuery('Ya has completado el proceso KYC');
        return;
      }
  
      // Si el usuario no ha completado el KYC, borra el mensaje actual y muestra el men煤 KYC
      await ctx.deleteMessage();
      await menuKYC.mostrarMenu(ctx);
  
    } catch (err) {
      console.log(err);
      await ctx.answerCbQuery('Ha ocurrido un error al procesar su solicitud');
    }
  });
  
  