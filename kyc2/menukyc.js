const { Markup } = require('telegraf');
const { terminos, mostrarTerminos } = require('./terminos');

function mostrarMenu(ctx) {
  const nombreUsuario = ctx.from.first_name;

  let menu = `👋 Bienvenid@ al Sistema del KYC para el Bot Firewallids, ${nombreUsuario}!\n\n`;
  menu += 'Por favor responda las siguientes preguntas:\n\n';
  menu += '1️⃣ Nombre completo\n';
  menu += '2️⃣ Número de identidad\n';
  menu += '3️⃣ Número de teléfono\n';
  menu += '4️⃣ Correo electrónico "Email"\n';
  menu += '5️⃣ Dirección particular\n';
  menu += '6️⃣ Municipio\n';
  menu += '7️⃣ Provincia\n';
  menu += '8️⃣ Foto de CI (frente)\n';
  menu += '9️⃣ Foto de CI (reverso)\n';
  menu += '🔟 Selfie mostrando un papel blanco que tenga escrito "Acepto los Términos y Condiciones del uso del Bot Firewallids" con su firma y la fecha actual\n';
  menu += '1️⃣1️⃣ Foto con un familiar mostrando su CI\n';
  menu += '1️⃣2️⃣ Foto del Documento de propiedad de su línea telefónica de ETECSA\n';
  menu += '1️⃣3️⃣ Foto de un Depósito en el banco que coincida con su nombre y apellidos\n\n';
  menu += 'Antes de comenzar, por favor lea y acepte los siguientes Términos y Condiciones:\n';

 
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
