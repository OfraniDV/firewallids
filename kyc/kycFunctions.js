const { pool } = require('../psql/db');
const { preguntas } = require('./preguntas');
const { queries } = require('./queries');
const { Markup } = require('telegraf');

async function hacerPregunta(ctx, pregunta) {
  const id_usuario = ctx.update.message.from.id;
  const preguntaActual = pregunta.id;
  const respuestaActual = pregunta.respuesta;

  try {
    // Insertar respuesta en la base de datos
    const client = await pool.connect();
    await client.query(queries.insertarRespuesta, [
      id_usuario,
      preguntaActual,
      respuestaActual
    ]);
    client.release();

    // Obtener la siguiente pregunta
    const siguientePregunta = preguntas[preguntaActual + 1];

    // Si ya no hay más preguntas, enviar mensaje de agradecimiento y guardar respuestas
    if (!siguientePregunta) {
      const agradecimiento =
        '👍 Gracias por proporcionar tu información, la revisaremos cuidadosamente.';

      // Enviar mensaje de agradecimiento
      ctx.reply(agradecimiento);

      // Actualizar estado del KYC a "esperando"
      const client2 = await pool.connect();
      await client2.query(queries.actualizarEstadoEsperando, [id_usuario]);
      client2.release();

      // Enviar mensaje de confirmación al administrador
      const mensajeAdmin =
        '👤 Nuevo usuario registrado en KYC, revisa la información y aprueba o rechaza.';

      // Enviar mensaje al administrador
      const adminId = process.env.ADMIN_ID;
      ctx.telegram.sendMessage(adminId, mensajeAdmin);

    } else {
      // Si hay más preguntas, enviar siguiente pregunta
      const siguientePreguntaTexto = siguientePregunta.pregunta;
      ctx.reply(`${siguientePreguntaTexto}`);
    }
  } catch (error) {
    console.error('Error en el KYC:', error);
    ctx.reply('Ha ocurrido un error en el proceso, por favor intenta de nuevo más tarde.');
  }
}

async function hacerPreguntas(ctx) {
  const id_usuario = ctx.update.message.from.id;

  try {
    // Actualizar estado del KYC a "proceso"
    const client = await pool.connect();
    await client.query(queries.actualizarEstadoProceso, [id_usuario]);
    client.release();

    // Obtener la primera pregunta
    const primeraPregunta = preguntas[1];

    // Enviar primera pregunta
    const primeraPreguntaTexto = primeraPregunta.pregunta;
    ctx.reply(`${primeraPreguntaTexto}`);
  } catch (error) {
    console.error('Error en el KYC:', error);
    ctx.reply('Ha ocurrido un error en el proceso, por favor intenta de nuevo más tarde.');
  }
}

module.exports = { hacerPreguntas, hacerPregunta };
