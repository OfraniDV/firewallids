const { Markup } = require('telegraf');
const { hacerPreguntas, verificarRespuesta } = require('./kycFunctions');

// Inicia el KYC
async function iniciarKyc(ctx) {
  console.log('Iniciando proceso de KYC...');
  const userId = ctx.from.id;
  const userName = ctx.from.first_name;
  const kyc = {
    userId: userId,
    preguntaActual: 1,
    respuestas: {},
    completado: false,
  };

  const mensaje = `Hola ${userName}, para poder proceder con la verificación de tu identidad, por favor responde a las siguientes preguntas:`;

  await ctx.reply(mensaje);

  hacerPreguntas(ctx, kyc);
}

// Maneja la respuesta del usuario
async function manejarRespuesta(ctx, kyc) {
  console.log('Manejando respuesta del usuario...');
  const respuesta = ctx.message.text;

  if (verificarRespuesta(respuesta, kyc.preguntaActual)) {
    kyc.respuestas[kyc.preguntaActual] = respuesta;
    kyc.preguntaActual++;

    if (kyc.preguntaActual > Object.keys(kyc.respuestas).length) {
      kyc.completado = true;
    }

    hacerPreguntas(ctx, kyc);
  } else {
    const preguntaActualTexto = Object.keys(kyc.respuestas).length + 1;
    await ctx.reply(`La respuesta ingresada no es válida. Por favor responde a la pregunta ${preguntaActualTexto} correctamente.`);
  }
}

module.exports = { iniciarKyc, manejarRespuesta };
