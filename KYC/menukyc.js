const { Markup } = require('telegraf');
const { terminos, mostrarTerminos } = require('./terminos');

function mostrarMenu(ctx) {
  const nombreUsuario = ctx.from.first_name;

  let menu = `👋 Bienvenid@ al Sistema del KYC para el Bot Firewallids, ${nombreUsuario}!\n\n`;
  menu += 'Estas son las preguntas que debera responder durante el Proceso del KYC:\n\n';
  menu += '👤 Nombre completo\n';
  menu += '🆔 Número de identidad\n';
  menu += '📱 Número de teléfono\n';
  menu += '📧 Correo electrónico "Email"\n';
  menu += '🌐 Enlace de su cuenta en Redes Sociales "Facebook"\n';
  menu += '🏠 Dirección particular\n';
  menu += '🌆 Municipio\n';
  menu += '🌎 Provincia\n';
  menu += '🆔 Foto de CI (frente)\n';
  menu += '🆔 Foto de CI (reverso)\n';
  menu += '🤳 Selfie mostrando un papel blanco que tenga escrito "Acepto los Términos y Condiciones del uso del Bot Firewallids" con su firma y la fecha actual\n';
  menu += '💰 Foto de un Depósito en el banco que coincida con su nombre y apellidos\n\n';
  menu += 'Le recomiendo que tenga todo listo para iniciar el proceso:\n';

  // Botones inline para iniciar o cancelar el proceso
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✅ Iniciar Proceso',
            callback_data: 'iniciarkyc'
          },
          {
            text: '❌ Cancelar Proceso',
            callback_data: 'cancelarkyc'
          }
        ]
      ]
    }
  };

  ctx.reply(menu, options);
}

function despedida(ctx) {
  ctx.reply('Gracias por utilizar el Sistema del KYC para el Bot Firewallids. Si necesita ayuda, escriba /ayuda.');
}

/// Manejador del evento callback_query para el botón "Iniciar Proceso"
function iniciarProceso(ctx) {
  ctx.deleteMessage(); // Eliminar el mensaje anterior
  mostrarTerminos(ctx); // Mostrar los términos
}

module.exports = {
  mostrarMenu,
  despedida,
  iniciarProceso
};
