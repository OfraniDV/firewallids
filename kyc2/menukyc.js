const { Markup } = require('telegraf');
const { terminos, mostrarTerminos } = require('./terminos');

function mostrarMenu(ctx) {
  const nombreUsuario = ctx.from.first_name;

  let menu = `Bienvenido al Sistema del KYC para el Bot Firewallids, ${nombreUsuario}!\n`;
  menu += 'A continuación le mostramos las preguntas que debe responder durante el proceso:\n\n';
  menu += '1. 👤 Nombre completo\n';
  menu += '2. 🆔 Número de identidad\n';
  menu += '5. 📞 Número de teléfono\n';
  menu += '6. 📧 Correo electrónico "Email"\n';
  menu += '7. 🏠 Dirección particular\n';
  menu += '8. 🏢 Provincia\n';
  menu += '9. 🌍 ¿Cuál es su país de origen?\n';
  menu += '10. 📄 Foto de su documento de identidad (frente)\n';
  menu += '11. 📄 Foto de su documento de identidad (reverso)\n';
  menu += '12. 👤 Selfie mostrando un papel blanco que tenga escrito acepto los Terminos y Condiciones del uso del Bot Firewallids con su firma y la fecha actual\n';
  menu += '13. 🖋 Envíeme una foto de su firma\n';
  menu += '14. 👨‍👩‍👧‍👦 Foto con un familiar mostrando su CI\n';
  menu += '15. 📝 Foto del Documento de propiedad de su línea telefónica de ETECSA\n';
  menu += '16. 💰 Foto de un Depósito en el banco que coincida con su nombre y apellidos\n\n';
  menu += 'Le recomiendo que tenga todo listo antes de continuar:\n';
  menu += 'Desea iniciar el Proceso del KYC?:';

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
            text: 'Cancelar Proceso ❌',
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

// Manejador del evento callback_query para el botón "Iniciar Proceso"
function iniciarProceso(ctx) {
  ctx.answerCbQuery();
  mostrarTerminos(ctx);
}

module.exports = {
  mostrarMenu,
  despedida,
  iniciarProceso
};
