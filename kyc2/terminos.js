const { Markup } = require('telegraf');

function mostrarTerminos(ctx) {
  let mensaje = `Antes de continuar, debe aceptar los siguientes términos y condiciones de uso:\n\n`;
  mensaje += `Este bot ha sido creado por Firewallids con el fin de realizar el proceso de KYC a todos los usuarios que deseen utilizar nuestros servicios. Al utilizar este bot, acepta proporcionar información veraz y confiable, y garantiza que es el titular de la línea telefónica y que la información proporcionada pertenece a la persona que desea utilizar nuestros servicios.\n\n`;
  mensaje += `Toda la información proporcionada será tratada con confidencialidad y solo se utilizará para los fines descritos. Firewallids se reserva el derecho de suspender el acceso a los servicios de aquellos usuarios que proporcionen información falsa o inexacta.\n\n`;
  mensaje += `¿Acepta los términos y condiciones de uso?`;

  const opciones = Markup.inlineKeyboard([
    Markup.button.callback('✅ Aceptar', 'aceptar'),
    Markup.button.callback('❌ Rechazar', 'rechazar'),
  ]).extra();

  ctx.reply(mensaje, opciones);
}

module.exports = {
  mostrarTerminos,
};
