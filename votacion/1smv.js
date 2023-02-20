const Markup = require('telegraf/markup');

// Primer menú para votación
async function votacionMV(ctx) {
  const userId = ctx.from.id;

  const startMessage = `🗳️ ¡Bienvenido a la votación de staff!

Esta votación es para elegir al Vice del CEO y los Revisores de KYC. Si desea postularse para un cargo, por favor hágalo seleccionando la opción "Postularme". Si desea votar por alguien, seleccione "Votar".`;

  const menuOptions = Markup.inlineKeyboard([
    Markup.callbackButton('📝 Postularme', 'postularme'),
    Markup.callbackButton('🗳️ Votar', 'votar'),
    Markup.callbackButton('📊 Ver resultados', 'resultados'),
    Markup.callbackButton('🚪 Salir de las votaciones', 'salir'),
  ]).extra();

  await ctx.reply(startMessage, menuOptions);
}

module.exports = {
  votacionMV,
};
