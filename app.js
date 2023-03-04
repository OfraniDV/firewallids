require('dotenv').config();

const { Telegraf, TelegramError } = require('telegraf');
const { Markup } = require('telegraf');
const moment = require('moment-timezone');
const currentDateTime = moment.tz('America/Havana');

// Esto es para poder recibir las imagenes
const axios = require('axios');
const fs = require('fs');
const path = require('path');




const { md, escapeMarkdown } = require('telegram-escape')

// Importar comandos
const { menuOptions } = require('./commands/menu');
const { comandosOptions } = require('./commands/comandos/comandos');
const { comandosUsuariosOptions } = require('./commands/comandos/usuarios');
const { administradoresOptions } = require('./commands/comandos/admins');
const { negociosOptions } = require('./commands/negocios/negocios');
const cambUsuarios = require('./commands/cambios/cambusuarios');
const cambNombres = require('./commands/cambios/cambnombres');

//Sobre la DB
const { pool } = require('./psql/db');
const pTimeout = require('p-timeout');

//Creando la tabla del KYC si no existe
const { createKycTable } = require('./KYC/kyctabla');


createKycTable()
  
//Esto de aqui es para hacer busquedas de cambios de alias y de nombre de un usuario
const { verificarRepeticionesIDNombres } = require('./psql/dblogic');
const { verificarRepeticionesIDUsuarios } = require('./psql/dblogic');
const { buscarCambiosCronologicosNombres } = require('./psql/dblogic');
const { buscarCambiosCronologicosUsuarios } = require('./psql/dblogic');


// IMPORTACION para el KYC 
const { kycMenu } = require('./KYC/kycmenu')
const { mostrarTerminos, aceptoTerminos } = require ('./KYC/kycterminos')
const { getUserResponses } = require('./KYC/kycrespuestas');
const { mostrarMenu, despedida, iniciarProceso } = require('./KYC/kycpresentacion');





//Conexion del BOT Variables de Entorno
const bot = new Telegraf(process.env.BOT_TOKEN, { allow_callback_query: true });
const ID_GROUP_VERIFY_KYC = process.env.ID_GROUP_VERIFY_KYC;
const owner = process.env.ID_USER_OWNER;




const urlKyc = process.env.URL_KYC;
const urlWeb = process.env.URL_WEB;
const gDenun = process.env.ID_GROUP_DENUNCIAS;
const gRecla = process.env.ID_GROUP_RECLAMAR;
const gSuppt = process.env.ID_GROUP_SUPPORT;
const canalD = process.env.ID_CHANNEL_REPORTS;
const gRecom = process.env.ID_GROUP_RECOMEND;
const nosotr = process.env.NOSOTROS;
const rules  = process.env.BOT_RULES;


// ****************          ****  // KYC //  *****       ************
// Manejador del comando kyc
bot.command('kyc', (ctx) => {
  if (ctx.chat.type !== 'private') {
    ctx.reply('🚫 Acceso denegado. Por favor, ejecuta este comando en el chat privado del bot.');
  } else {
    ctx.reply('👤 Bienvenido al proceso de KYC. Por favor, selecciona la opción que deseas ingresar:', kycMenu);
  }
});
  

//Botón KYC del Primer menu de COMANDOS PARA USUARIOS
bot.action('kyc', async (ctx) => {
  // Verifica si el botón se está ejecutando en el chat privado con el bot
  if (ctx.chat.type !== 'private') {
    // Si no es el chat privado con el bot, muestra un mensaje de acceso denegado
    await ctx.answerCbQuery('🚫 Acceso denegado. Este botón solo está disponible en el chat privado con el bot');
    return;
  }

  // Obtiene el ID del usuario
  const userId = ctx.from.id;

  try {
    // Consulta si el usuario ya completó el KYC en la tabla kycfirewallids
    const kycResult = await pool.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [userId]);

    if (kycResult.rows.length > 0) {
      // Si el usuario ya completó el KYC, envía un mensaje indicando que ya completó el proceso
      await ctx.answerCbQuery('Ya has completado el proceso KYC');
      return;
    }

    // Consulta si el usuario ya completó el KYC en la tabla identidades
    const idResult = await pool.query('SELECT * FROM identidades WHERE usuario_id = $1', [userId]);

    if (idResult.rows.length > 0) {
      // Si el usuario ya completó el KYC, envía un mensaje indicando que ya completó el proceso
      await ctx.answerCbQuery('Ya has completado el proceso KYC');
      return;
    }

    // Si el usuario no ha completado el KYC, borra el mensaje actual y muestra el menú KYC
    await ctx.deleteMessage();
    await mostrarMenu(ctx);

  } catch (err) {
    console.log(err);
    await ctx.answerCbQuery('Ha ocurrido un error al procesar su solicitud');
  }
});


//  BOTONES DE LOS MENUS DEL KYC
// menu kyc
// Botón iniciar proceso
bot.action('iniciarkyc', (ctx) => {
  ctx.answerCbQuery();
  ctx.deleteMessage();
  mostrarTerminos(ctx);
});
// Botón cancelar proceso
bot.action('cancelarkyc', (ctx) => {
  ctx.answerCbQuery();
  ctx.deleteMessage();
  despedida(ctx);
});

// Acción para aceptar los términos y condiciones
bot.action('aceptoTerminos', async (ctx) => {
  const userId = ctx.from.id;
  console.log('User ID:', userId);

  // Verificar si ya existe una fila correspondiente al usuario en la tabla
  pool.query('SELECT * FROM kycfirewallids WHERE user_id::text = $1', [String(userId)], (err, result) => {
    if (err) {
      console.error(err);
      return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }

    console.log('User ID found:', result.rowCount === 1);

    // Si no existe una fila correspondiente al usuario, crear una nueva fila
    if (result.rowCount === 0) {
      pool.query('INSERT INTO kycfirewallids (user_id, terms_accepted) VALUES ($1, true)', [BigInt(userId)], (err, result) => {
        if (err) {
          console.error(err);
          return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
        }

        console.log('Result:', result);

        if (result.rowCount === 1) {
          ctx.answerCbQuery();
          ctx.deleteMessage();
          ctx.reply('¡Gracias por aceptar los términos y condiciones! Por favor, ingrese la siguiente información para completar el proceso KYC:', kycMenu);
        }
      });
    } else {
      ctx.answerCbQuery();
      ctx.deleteMessage();
      ctx.reply('¡Ya has aceptado los términos y condiciones anteriormente! Por favor, ingrese la siguiente información para completar el proceso KYC:', kycMenu);
    }
  });
});



// Manejador del evento callback_query para el botón "No Acepto"
bot.action('noAceptoTerminos', (ctx) => {
  ctx.answerCbQuery();
  ctx.deleteMessage();
  ctx.reply('Lo sentimos, solo podemos realizar el KYC a los usuarios que aceptan nuestras condiciones. Si necesita ayuda, escriba /ayuda.');
});

//Cancelar una vez dentro del menu del KYC
bot.action('cancelKYC', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage(); // Eliminar mensaje anterior con opciones KYC
  await ctx.reply('Proceso KYC cancelado.');
});



///////////////////////////////////////////////////////////////////////////////////
//                          Acciones de los Botones de preguntas del KYC
///////////////////////////////////////////////////////////////////////////////////

//                                               Nombre Completo
bot.action('insertName', (ctx) => {
  const firstName = ctx.from.first_name;
  ctx.reply(`📝¡${firstName}!, para cumplir con el proceso KYC, por favor proporciona tu nombre real como aparece en tu documento de identidad. Ejecuta el siguiente comando /nombre seguido de tu nombre completo.`);
});

// Comando para guardar el nombre completo del usuario
bot.command('nombre', (ctx) => {
  const userId = ctx.from.id;
  const name = ctx.message.text.substring(7).trim();

  // Consultar si el usuario ya tiene un nombre registrado en la base de datos
  pool.query('SELECT name FROM kycfirewallids WHERE user_id = $1', [userId], (err, result) => {
    if (err) {
      console.error(err);
      return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }

    // Si el usuario no tiene un nombre registrado, insertar el nuevo nombre en la base de datos
    if (result.rows.length === 0) {
      pool.query('INSERT INTO kycfirewallids (user_id, name) VALUES ($1, $2)', [userId, name], (err) => {
        if (err) {
          console.error(err);
          return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
        }

        // Responder al usuario con un emoji y el mensaje de confirmación
        ctx.reply('✅ Gracias, hemos guardado tu nombre. Ahora toca el próximo botón para continuar con el proceso de KYC.');
      });
    }

    // Si el usuario ya tiene un nombre registrado, actualizar el nombre en la base de datos
    else {
      pool.query('UPDATE kycfirewallids SET name = $1 WHERE user_id = $2', [name, userId], (err) => {
        if (err) {
          console.error(err);
          return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
        }

        // Responder al usuario con un emoji y el mensaje de confirmación
        ctx.reply('✅ Gracias, hemos actualizado tu nombre. Ahora toca el próximo botón para continuar con el proceso de KYC.');
      });
    }
  });
});


//                          NUMERO DE IDENTIDAD
// Acción para pedir el número de identidad del usuario
bot.action('insertIdentityNumber', (ctx) => {
  const firstName = ctx.from.first_name;

  ctx.reply(`🆔 ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu número de identidad real. Ejecuta el siguiente comando /identidad seguido de tu número de identidad sin espacios ni guiones. Por ejemplo: /identidad ************.`);
});

//El Comando Identidad
// Comando para guardar el número de identidad del usuario
bot.command('identidad', (ctx) => {
  const userId = ctx.from.id;
  const identityNumber = ctx.message.text.substring(10).replace(/ /g, '');

  // Actualizar el número de identidad del usuario en la base de datos
  pool.query('UPDATE kycfirewallids SET identity_number = $1 WHERE user_id = $2', [identityNumber, userId], (err) => {
    if (err) {
      console.error(err);
      return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }

    // Responder al usuario con un emoji y el mensaje de confirmación
    ctx.reply('👍 Gracias, hemos registrado tu número de identidad. Ahora toca el próximo botón para continuar con el proceso de KYC.');
  });
});

//                    NUMERO DE TELEFONO
// Acción para pedir el número de teléfono del usuario
bot.action('insertPhoneNumber', (ctx) => {
  const firstName = ctx.from.first_name;

  ctx.reply(`📞 ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu número de teléfono. Ejecuta el siguiente comando /telefono seguido de tu número de teléfono con el código de país sin espacios ni guiones. Por ejemplo: /telefono +1234567890.`);
});
//COMANDO DEL NUMERO DE TELEFONO
// Comando para guardar el número de teléfono del usuario
bot.command('telefono', (ctx) => {
  const userId = ctx.from.id;
  const phoneNumber = ctx.message.text.substring(9).replace(/ /g, '');

  // Actualizar el número de teléfono del usuario en la base de datos
  pool.query('UPDATE kycfirewallids SET phone_number = $1 WHERE user_id = $2', [phoneNumber, userId], (err) => {
    if (err) {
      console.error(err);
      return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }

    // Responder al usuario con un emoji y el mensaje de confirmación
    ctx.reply('👍 Gracias, hemos registrado tu número de teléfono. Ahora toca el próximo botón para continuar con el proceso de KYC.');
  });
});

//                                      CORREO ELECTRONICO
// Acción para pedir la dirección de correo electrónico del usuario
bot.action('insertEmail', (ctx) => {
  const firstName = ctx.from.first_name;

  ctx.reply(`📧 ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu dirección de correo electrónico. Ejecuta el siguiente comando /correo seguido de tu dirección de correo electrónico. Por ejemplo: /correo ejemplo@ejemplo.com.`);
});
// comando del email
// Comando para guardar la dirección de correo electrónico del usuario
bot.command('correo', (ctx) => {
  const userId = ctx.from.id;
  const email = ctx.message.text.substring(8);

  // Actualizar el correo electrónico del usuario en la base de datos
  pool.query('UPDATE kycfirewallids SET email = $1 WHERE user_id = $2', [email, userId], (err) => {
    if (err) {
      console.error(err);
      return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }

    // Responder al usuario con un emoji y el mensaje de confirmación
    ctx.reply('👍 Gracias, hemos registrado tu dirección de correo electrónico. Ahora toca el próximo botón para continuar con el proceso de KYC.');
  });
});

//                                                  DIRECCION PARTICULAR
// Acción para pedir la dirección del usuario
bot.action('insertAddress', (ctx) => {
  const firstName = ctx.from.first_name;

  ctx.reply(`🏠 ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu dirección. Ejecuta el siguiente comando /direccion seguido de tu dirección. Por ejemplo: /direccion Calle 123 # 45 - 67.`);
});

// Comando para guardar la dirección del usuario
bot.command('direccion', (ctx) => {
  const userId = ctx.from.id;
  const address = ctx.message.text.substring(11);

  // Actualizar la dirección del usuario en la base de datos
  pool.query('UPDATE kycfirewallids SET address = $1 WHERE user_id = $2', [address, userId], (err) => {
    if (err) {
      console.error(err);
      return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }

    // Responder al usuario con un emoji y el mensaje de confirmación
    ctx.reply('👍 Gracias, hemos registrado tu dirección. Ahora toca el próximo botón para continuar con el proceso de KYC.');
  });
});


//                                                  MUNICIPIO
// Acción para pedir el municipio del usuario
bot.action('insertMunicipality', (ctx) => {
  const firstName = ctx.from.first_name;

  ctx.reply(`🏙️ ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu municipio. Ejecuta el siguiente comando /municipio seguido de tu municipio. Por ejemplo: /municipio Medellín.`);
});
// comando
// Comando para guardar el municipio del usuario
bot.command('municipio', (ctx) => {
  const userId = ctx.from.id;
  const municipality = ctx.message.text.substring(10);

  // Actualizar el municipio del usuario en la base de datos
  pool.query('UPDATE kycfirewallids SET municipality = $1 WHERE user_id = $2', [municipality, userId], (err) => {
    if (err) {
      console.error(err);
      return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }

    // Responder al usuario con un emoji y el mensaje de confirmación
    ctx.reply('👍 Gracias, hemos registrado tu municipio. Ahora toca el próximo botón para continuar con el proceso de KYC.');
  });
});


//                                                PROVINCIA 
// Acción para pedir la provincia del usuario
bot.action('insertProvince', (ctx) => {
  const firstName = ctx.from.first_name;

  ctx.reply(`🌅 ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu provincia. Ejecuta el siguiente comando /provincia seguido de tu provincia. Por ejemplo: /provincia Antioquia.`);
});

// Comando para guardar la provincia del usuario
bot.command('provincia', (ctx) => {
  const userId = ctx.from.id;
  const province = ctx.message.text.substring(10);

  // Actualizar la provincia del usuario en la base de datos
  pool.query('UPDATE kycfirewallids SET province = $1 WHERE user_id = $2', [province, userId], (err) => {
    if (err) {
      console.error(err);
      return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }

    // Responder al usuario con un emoji y el mensaje de confirmación
    ctx.reply('👍 Gracias, hemos registrado tu provincia. Ahora toca el próximo botón para continuar con el proceso de KYC.');
  });
});


//                                  FOTOS DEL KYC
// Foto del Doc Id Front
// Estado del bot
const botState = {
  esperaFoto: false,
};

// Escuchar el botón y enviar mensaje al usuario
bot.action('insertIdCardFront', async (ctx) => {
  if (!botState.esperaFoto) {
    botState.esperaFoto = true;
    await ctx.reply('Por favor, envíame una foto del frente de tu documento de identidad');
  } else {
    await ctx.reply('Ya estoy esperando una foto, por favor envía la foto antes de continuar');
  }
});

// Escuchar la respuesta del usuario y guardar la foto en la base de datos
bot.on('photo', async (ctx) => {
  if (botState.esperaFoto) {
    const userId = ctx.from.id;
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const file = await ctx.telegram.getFile(fileId);
    const photoBuffer = await axios.get(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`, { responseType: 'arraybuffer' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [userId]);
      if (result.rows.length === 0) {
        await client.query('INSERT INTO kycfirewallids(user_id) VALUES ($1)', [userId]);
      }
      const query = 'UPDATE kycfirewallids SET id_card_front = $1 WHERE user_id = $2';
      const values = [photoBuffer.data, userId];
      await client.query(query, values);
      await client.query('COMMIT');
      await ctx.reply('Se ha guardado tu foto exitosamente');
      botState.esperaFoto = false;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else {
    await ctx.reply('No estoy esperando una foto en este momento');
  }
});

// Foto Doc Id Back
// Escuchar el botón y enviar mensaje al usuario
bot.action('insertIdCardBack', async (ctx) => {
  if (!botState.esperaFoto) {
    botState.esperaFoto = true;
    await ctx.reply('Por favor, envíame una foto del reverso de tu documento de identidad');
  } else {
    await ctx.reply('Ya estoy esperando una foto, por favor envía la foto antes de continuar');
  }
});

// Escuchar la respuesta del usuario y guardar la foto en la base de datos
bot.on('photo', async (ctx) => {
  if (botState.esperaFoto) {
    const userId = ctx.from.id;
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const file = await ctx.telegram.getFile(fileId);
    const photoBuffer = await axios.get(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`, { responseType: 'arraybuffer' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [userId]);
      if (result.rows.length === 0) {
        await client.query('INSERT INTO kycfirewallids(user_id) VALUES ($1)', [userId]);
      }
      const query = 'UPDATE kycfirewallids SET id_card_back = $1 WHERE user_id = $2';
      const values = [photoBuffer.data, userId];
      await client.query(query, values);
      await client.query('COMMIT');
      await ctx.reply('Se ha guardado tu foto exitosamente');
      botState.esperaFoto = false;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else {
    await ctx.reply('No estoy esperando una foto en este momento');
  }
});

// Selfie
// Escuchar el botón y enviar mensaje al usuario
bot.action('insertSelfiePhoto', async (ctx) => {
  if (!botState.esperaFoto) {
    botState.esperaFoto = true;
    await ctx.reply('Por favor, envíame una selfie tuya');
  } else {
    await ctx.reply('Ya estoy esperando una foto, por favor envía la foto antes de continuar');
  }
});

// Escuchar la respuesta del usuario y guardar la foto en la base de datos
bot.on('photo', async (ctx) => {
  if (botState.esperaFoto) {
    const userId = ctx.from.id;
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const file = await ctx.telegram.getFile(fileId);
    const photoBuffer = await axios.get(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`, { responseType: 'arraybuffer' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [userId]);
      if (result.rows.length === 0) {
        await client.query('INSERT INTO kycfirewallids(user_id) VALUES ($1)', [userId]);
      }
      const query = 'UPDATE kycfirewallids SET selfie_photo = $1 WHERE user_id = $2';
      const values = [photoBuffer.data, userId];
      await client.query(query, values);
      await client.query('COMMIT');
      await ctx.reply('Se ha guardado tu foto exitosamente');
      botState.esperaFoto = false;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else {
    await ctx.reply('No estoy esperando una foto en este momento');
  }
});

//Deposito en el banco
// Escuchar el botón y enviar mensaje al usuario
bot.action('insertDepositPhoto', async (ctx) => {
  if (!botState.esperaFoto) {
    botState.esperaFoto = true;
    await ctx.reply('Por favor, envíame una foto del comprobante de tu depósito');
  } else {
    await ctx.reply('Ya estoy esperando una foto, por favor envía la foto antes de continuar');
  }
});

// Escuchar la respuesta del usuario y guardar la foto en la base de datos
bot.on('photo', async (ctx) => {
  if (botState.esperaFoto) {
    const userId = ctx.from.id;
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const file = await ctx.telegram.getFile(fileId);
    const photoBuffer = await axios.get(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`, { responseType: 'arraybuffer' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [userId]);
      if (result.rows.length === 0) {
        await client.query('INSERT INTO kycfirewallids(user_id) VALUES ($1)', [userId]);
      }
      const query = 'UPDATE kycfirewallids SET deposit_photo = $1 WHERE user_id = $2';
      const values = [photoBuffer.data, userId];
      await client.query(query, values);
      await client.query('COMMIT');
      await ctx.reply('Se ha guardado tu foto exitosamente');
      botState.esperaFoto = false;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else {
    await ctx.reply('No estoy esperando una foto en este momento');
  }
});







//                              ENLACE DE SU CUENTA DE FACEBOOK

// Acción para pedir la cuenta de Facebook del usuario
bot.action('insertFacebook', (ctx) => {
  const firstName = ctx.from.first_name;

  ctx.reply(`👤 ¡Hola ${firstName}! Para continuar con el proceso KYC, por favor proporciona tu cuenta de Facebook. Ejecuta el siguiente comando /facebook seguido de tu nombre de usuario. Por ejemplo: /facebook juan.perez`);
});
// comando
// Comando para guardar la cuenta de Facebook del usuario
bot.command('facebook', (ctx) => {
  const userId = ctx.from.id;
  const facebook = ctx.message.text.substring(9);

  // Actualizar la cuenta de Facebook del usuario en la base de datos
  pool.query('UPDATE kycfirewallids SET facebook = $1 WHERE user_id = $2', [facebook, userId], (err) => {
    if (err) {
      console.error(err);
      return ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
    }

    // Responder al usuario con un emoji y el mensaje de confirmación
    ctx.reply('👍 Gracias, hemos registrado tu cuenta de Facebook. Ahora toca el próximo botón para continuar con el proceso de KYC.');
  });
});






//                                ***  Enviar a Revisiones ***

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
const instructionsMsg = `🔍 *Nueva solicitud de verificación de KYC*\n\n` +
  `🆔 *ID de usuario:* ${userId}\n` +
  `🔹*Alias:* @${ctx.from.username}\n\n` +
  `👉 *Por favor, revisa la información del usuario y toma una decisión:* \n\n` +
  `✅ Si deseas *aprobar* la verificación, escribe:\n` +
  `/aprobarkyc ${userId}\n\n` +
  `❌ Si deseas *rechazar* la verificación, escribe:\n` +
  `/rechazarkyc ${userId}\n\n` +
  `Recuerda que *aprobar* un KYC es una tarea importante que requiere responsabilidad y atención, ya que un KYC aprobado implica que el usuario ha verificado su identidad, mientras que un KYC rechazado puede afectar la capacidad del usuario para utilizar nuestros servicios.\n\n` +
  `Gracias por tu colaboración.`;
await bot.telegram.sendMessage(ID_GROUP_VERIFY_KYC, instructionsMsg, { parse_mode: 'Markdown' });

  } catch (err) {
    console.error(`Error generando el reporte KYC: ${err.message}`);
    await ctx.reply('Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
  }
});






//  ***************Comando para los Administradores Aprobar o Rechazar el KYC ***************
//FUNCION APROBAR KYC
async function aprobarKYC(ctx) {
  const kycId = ctx.message.text.match(/\d+/g)[0];
  console.log(`Valor de ctx.message.text: ${ctx.message.text}`); // Agregar esta línea
  //
  const adminId = ctx.from.id;

  try {
    // Buscar la solicitud de KYC por el ID
    const kyc = await pool.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [kycId]);
    if (kyc.rowCount === 0) {
      console.error(`No se pudo encontrar la solicitud de KYC con ID ${kycId}`);
      return ctx.reply('Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.');
    }

    // Verificar que el administrador tenga permiso para aprobar la solicitud de KYC
    const admin = await pool.query('SELECT * FROM listanegra_administradores WHERE id = $1', [adminId]);
    if (admin.rowCount === 0) {
      console.error(`El administrador con ID ${adminId} no está autorizado para aprobar la solicitud de KYC con ID ${kycId}`);
      return ctx.reply('Lo siento, no estás autorizado para aprobar la solicitud de KYC.');
    }

    // Actualizar la fila correspondiente en la tabla kycfirewallids
    const userId = kyc.rows[0].user_id;
    await pool.query('UPDATE kycfirewallids SET approved = true, admin_id = $1, pending = null, rejected = null WHERE id = $2', [adminId, kycId]);

    // Notificar al usuario que su KYC ha sido aprobado
    const chatMember = await bot.telegram.getChatMember(ID_GROUP_VERIFY_KYC, userId);
    if (chatMember && chatMember.user) {
      const userFirstName = chatMember.user.first_name;
      const userLastName = chatMember.user.last_name || '';
      await bot.telegram.sendMessage(userId, `🎉 Hola ${userFirstName} ${userLastName}, tu KYC ha sido aprobado. ¡Gracias por verificar tu identidad con FirewallIDs!`);
    }

    // Notificar al administrador que la solicitud de KYC ha sido aprobada
    await ctx.reply(`KYC con ID ${kycId} aprobado exitosamente.`);

  } catch (err) {
    console.error(`Error aprobando KYC: ${err}`);
    await ctx.reply('Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.');
  }
}
bot.command('aprobarkyc', aprobarKYC);

























// Cuando el usuario ejecuta el comando /start en el chat privado del bot

bot.start((ctx) => {
  // Obtener el ID y nombre del usuario
  const id = ctx.from.id;
  const nombre = ctx.from.first_name;

 // Enviar mensaje de bienvenida
  ctx.reply(`Saludos ${nombre} 📩 !\n\n🆔 Este es tu ID en Telegram: ${id}\n\n🛡️ ¡Bienvenido a FirewallIds! Somos un servicio de seguridad en línea que se enfoca en la protección de tus datos personales y la prevención de actividades cibernéticas maliciosas.\n\n🤖 Puedo ayudarte si ejecutas el comando /ayuda.`);
});



//Menu Ayuda y Comandos del Bot***************************************************

// Comando para mostrar el menú inline
bot.command('ayuda', (ctx) => {
  return ctx.reply('Por favor selecciona una opción:', menuOptions);
});

bot.command('comandos', (ctx) => {
  return ctx.reply('Aquí están los comandos:', comandosOptions);
});

bot.action('comandos', (ctx) => {
  return ctx.editMessageText('Aquí están los comandos:', comandosOptions);
});

bot.catch(err => {
  if (!(err instanceof TelegramError)) throw err
  console.error(err)
})

// Manejador de acción para el botón "Para Usuarios"
bot.action('comandos_usuarios', (ctx) => {
  ctx.editMessageText('Estos son los comandos disponibles a todos los Usuarios:', comandosUsuariosOptions);
});

// Manejador de acción para el botón "Regresar" del menú de usuarios o Administradores
let comandosMessageId; // variable para guardar el message_id del mensaje del menú de comandos
let submenuMessageId; // variable para guardar el message_id del mensaje del submenú

// Manejador de acción para el botón "Usuarios" del menú de comandos
bot.action('usuarios', async (ctx) => {
  // Eliminar el mensaje actual
  await ctx.deleteMessage();

  // Mostrar el submenú de usuarios
  const submenuMessage = await ctx.reply('Selecciona una opción:', comandosUsuariosOptions);
  submenuMessageId = submenuMessage.message_id; // guardar el message_id del mensaje del submenú
});

// Manejador de acción para el botón "Regresar" del menú de usuarios
bot.action('menu_anterior', async (ctx) => {
  // Eliminar los mensajes anteriores (menú de comandos y submenú)
  await ctx.deleteMessage(comandosMessageId);
  await ctx.deleteMessage(submenuMessageId);

  // Mostrar el menú de comandos
  const comandosMessage = await ctx.reply('Selecciona una opción:', comandosOptions);
  comandosMessageId = comandosMessage.message_id; // guardar el message_id del mensaje del menú de comandos
});







// Manejador de acción para el botón "Para Adminstradores"
bot.action('comandos_administradores', (ctx) => {
  ctx.editMessageText('Estos son los comandos Extra para Administradores:', administradoresOptions);
});




//Botón Nuestra Web
bot.action('web', (ctx) => {
  // Redireccionar a la URL de WEB
ctx.replyWithHTML(`Para ver nuestra Web, da clic <a href="${urlWeb}">aquí</a>.`, { disable_web_page_preview: false });
});

//Grupo de Denuncias
bot.action('denunciar', (ctx) => {
  // Redireccionar a la URL de WEB
ctx.replyWithHTML(`Para hacer una Denuncia puedes, da clic <a href="${gDenun}">aquí</a>.`, { disable_web_page_preview: false });
});

//Grupo de Reclamaciones
bot.action('reclamaciones', (ctx) => {
  // Redireccionar a la URL de WEB
ctx.replyWithHTML(`Si fuiste sanciondo y quieres hacer una Reclamación, da clic <a href="${gRecla}">aquí</a>.`, { disable_web_page_preview: false });
});

//Grupo de Soporte Técnico
bot.action('soporte', (ctx) => {
  // Redireccionar a la URL de WEB
ctx.replyWithHTML(`Si deseas entrar en el Grupos de Soporte Técnico, da clic <a href="${gSuppt}">aquí</a>.`, { disable_web_page_preview: false });
});

//Canal de Denuncias
bot.action('canal', (ctx) => {
  // Redireccionar a la URL del Canal
ctx.replyWithHTML(`Si quieres ver el Canal donde hemos publicado todos los casos, da clic <a href="${canalD}">aquí</a>.`, { disable_web_page_preview: false });
});

//Canal de Grupos que Recomendamos
bot.action('grupos', (ctx) => {
  // Redireccionar a la URL del Canal de los Grupos que Recomendamos
ctx.replyWithHTML(`Para ver los grupos que recomendamos por su transparencia y seguridad, da clic <a href="${gRecom}">aquí</a>.`, { disable_web_page_preview: false });
});

//Sobre Nosotros
bot.action('nosotros', (ctx) => {
  // Redireccionar a la URL en nuestra Web que habla Sobre Nosotros
ctx.replyWithHTML(`Para leer Sobre Nosotros, da clic <a href="${nosotr}">aquí</a>.`, { disable_web_page_preview: false });
});

//Nuestras Reglas
bot.action('reglas', (ctx) => {
  // Redireccionar a la URL Del Canal de Denuncias al Mensaje donde Estan las Reglas del Bot
ctx.replyWithHTML(`Para ver nuestras Reglas, da clic <a href="${rules}">aquí</a>.`, { disable_web_page_preview: false });
});



/*****************************************************************/
//Boton y comando Cambios del Menu Para Usuarios
bot.action('cambios', (ctx) => {
  const message = `📝 Con el comando /cambios puedes consultar los cambios de alias y/o de nombres que ha tenido un usuario en el pasado. Simplemente escribe /cambios seguido del ID de usuario o del @alias del usuario que quieres consultar. El informe detallado se mostrará cronológicamente y te indicará los cambios que ha tenido tanto en su nombre como en su @alias.

Si tienes dudas, puedes consultar la sección de ayuda en el menú principal. ¡Gracias por usar nuestro bot! 🤖`;
  ctx.reply(message);
});

/********************************************************************************** */
// Manejador de comandos para /cambios
//************************************************************************************/

// Manejador de comandos para /cambios
bot.command('cambios', async (ctx) => {
  // Obtener información del usuario que ejecutó el comando
  const userId = ctx.message.from.id;
  let id = userId;
  let nombreUsuario = ctx.message.from.first_name;

  // Obtener ID si se proporcionó un alias de usuario
if (ctx.message.text.split(' ').length > 1) {
  const input = ctx.message.text.split(' ')[1];
  let user;
  if (input.startsWith('@')) {
    const username = input.substring(1);
    try {
      user = await ctx.telegram.getChat(username);
    } catch (error) {
      console.error(error);
    }
  } else {
    try {
      user = await ctx.telegram.getChat(input);
    } catch (error) {
      console.error(error);
    }
  }
  if (user) {
    id = user.id;
    nombreUsuario = user.first_name;
  }
}


  // Obtener el informe de cambios de usuario y mostrarlo
  await cambUsuarios(ctx, id, nombreUsuario);

  // Obtener el informe de cambios de nombre y mostrarlo
  await cambNombres(ctx, id, nombreUsuario);
});







/**********************************************************************************

















//Demas Botones *************************************************************************************

// Acción para el botón de Ayuda
bot.action('ayuda', (ctx) => {
  // Eliminar el mensaje actual
  ctx.deleteMessage();
  // Mostrar mensaje de ayuda
  ctx.reply('Aquí puedes encontrar ayuda sobre el uso del bot y sus comandos.', comandosUsuariosOptions);
});

// Acción para el botón de Reputación
bot.action('reputacion', (ctx) => {
  // Eliminar el mensaje actual
  ctx.deleteMessage();
  // Mostrar mensaje de reputación
  ctx.reply('Aquí puedes encontrar información sobre tu reputación en el grupo y cómo mejorarla.', comandosUsuariosOptions);
});

// Acción para el botón de Buscar
bot.action('buscar', (ctx) => {
  // Eliminar el mensaje actual
  ctx.deleteMessage();
  // Mostrar mensaje de búsqueda
  ctx.reply('Aquí puedes buscar mensajes antiguos en el grupo.', comandosUsuariosOptions);
});

// Acción para el botón de RepuInfo
bot.action('repuinfo', (ctx) => {
  // Eliminar el mensaje actual
  ctx.deleteMessage();
  // Mostrar mensaje de información de reputación
  ctx.reply('Aquí puedes encontrar información detallada sobre el sistema de reputación del grupo.', comandosUsuariosOptions);
});

// Acción para el botón de RepuPositiva
bot.action('repupositiva', (ctx) => {
  // Eliminar el mensaje actual
  ctx.deleteMessage();
  // Mostrar mensaje de reputación positiva
  ctx.reply('Aquí puedes enviar una reputación positiva a un usuario del grupo.', comandosUsuariosOptions);
});

// Acción para el botón de RepuNegativa
bot.action('repunegativa', (ctx) => {
  // Eliminar el mensaje actual
  ctx.deleteMessage();
  // Mostrar mensaje de reputación negativa
  ctx.reply('Aquí puedes enviar una reputación negativa a un usuario del grupo.', comandosUsuariosOptions);
});

// Acción para el botón de KYC
bot.action('kyc', (ctx) => {
  // Eliminar el mensaje actual
  ctx.deleteMessage();
  // Mostrar mensaje de KYC
  ctx.reply('Aquí puedes enviar la documentación necesaria para verificar tu identidad en el grupo.', comandosUsuariosOptions);
});

// Acción para el botón de TYC
bot.action('tyc', (ctx) => {
  // Eliminar el mensaje actual
  ctx.deleteMessage();
  // Mostrar mensaje de TYC
  ctx.reply('Aquí puedes encontrar los términos y condiciones de uso del bot y del grupo.', comandosUsuariosOptions);
});



/****************************************************************/




/*************************************************************************/
















//***************************************************************************************************************************************** */


// Comando /negocios
bot.command('negocios', async (ctx) => {
  // Obtener el ID del usuario
  const userId = ctx.from.id;

  try {
    // Obtener el registro del usuario en la tabla 'usuarios' de la base de datos
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);

    if (rows.length === 0) {
      // Si el usuario no tiene un registro en la tabla, mostrar un mensaje de acceso denegado
      return ctx.replyWithMarkdown(`
🚨🚨🚨 **ATENCIÓN** 🚨🚨🚨

Lo siento, tu cuenta no tiene permiso para acceder a esta sección. Para realizar transacciones en la sección de negocios, es necesario realizar un proceso de verificación de identidad conocido como KYC (*Know Your Customer*).

Para más información sobre el proceso de KYC y cómo realizarlo, por favor ejecuta el comando /ayuda.

Gracias por tu comprensión.
      `);
    }

    // Obtener el valor de 'verificado' del registro del usuario
    const { verificado } = rows[0];

    if (verificado) {
      // Si el usuario está verificado, mostrar un mensaje de bienvenida y el menú de opciones de negocios
      return ctx.replyWithMarkdown(`
🎉🎉🎉 ¡Felicidades! 🎉🎉🎉

Tu cuenta ha sido verificada y tienes acceso a la sección de negocios. Por favor selecciona una opción:

`, negociosOptions);
    } else {
      // Si el usuario no está verificado, mostrar un mensaje de acceso denegado
      return ctx.replyWithMarkdown(`
🚨🚨🚨 **ATENCIÓN** 🚨🚨🚨

Lo siento, tu cuenta no tiene permiso para acceder a esta sección. Para realizar transacciones en la sección de negocios, es necesario realizar un proceso de verificación de identidad conocido como KYC (*Know Your Customer*).

Por favor completa el proceso de verificación de identidad y espera a que tu cuenta sea aprobada. Para más información sobre el proceso de KYC y cómo realizarlo, por favor ejecuta el comando /ayuda.

Gracias por tu comprensión.
      `);
    }
  } catch (err) {
    // Si ocurre un error al obtener la información del usuario, mostrar un mensaje de error
    console.error(err);
    return ctx.replyWithMarkdown(`
🚫🚫🚫 **ATENCIÓN** 🚫🚫🚫

Lo siento, ha ocurrido un error al comprobar tu estado de verificación. Por favor, intenta de nuevo más tarde. Si el problema persiste, por favor ejecuta el comando /ayuda.
    `);
  }
});

// Boton /negocios
bot.action('negocios', async (ctx) => {
  // Obtener el ID del usuario
  const userId = ctx.from.id;

  try {
    // Obtener el registro del usuario en la tabla 'usuarios' de la base de datos
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);

    if (rows.length === 0) {
      // Si el usuario no tiene un registro en la tabla, mostrar un mensaje de acceso denegado
      return ctx.replyWithMarkdown(`
🚨🚨🚨 **ATENCIÓN** 🚨🚨🚨

Lo siento, tu cuenta no tiene permiso para acceder a esta sección. Para realizar transacciones en la sección de negocios, es necesario realizar un proceso de verificación de identidad conocido como KYC (*Know Your Customer*).

Para más información sobre el proceso de KYC y cómo realizarlo, por favor ejecuta el comando /ayuda.

Gracias por tu comprensión.
      `);
    }

    // Obtener el valor de 'verificado' del registro del usuario
    const { verificado } = rows[0];

    if (verificado) {
      // Si el usuario está verificado, mostrar un mensaje de bienvenida y el menú de opciones de negocios
      return ctx.replyWithMarkdown(`
🎉🎉🎉 ¡Felicidades! 🎉🎉🎉

Tu cuenta ha sido verificada y tienes acceso a la sección de negocios. Por favor selecciona una opción:

`, negociosOptions);
    } else {
      // Si el usuario no está verificado, mostrar un mensaje de acceso denegado
      return ctx.replyWithMarkdown(`
🚨🚨🚨 **ATENCIÓN** 🚨🚨🚨

Lo siento, tu cuenta no tiene permiso para acceder a esta sección. Para realizar transacciones en la sección de negocios, es necesario realizar un proceso de verificación de identidad conocido como KYC (*Know Your Customer*).

Por favor completa el proceso de verificación de identidad y espera a que tu cuenta sea aprobada. Para más información sobre el proceso de KYC y cómo realizarlo, por favor ejecuta el comando /ayuda.

Gracias por tu comprensión.
      `);
    }
  } catch (err) {
    // Si ocurre un error al obtener la información del usuario, mostrar un mensaje de error
    console.error(err);
    return ctx.replyWithMarkdown(`
🚫🚫🚫 **ATENCIÓN** 🚫🚫🚫

Lo siento, ha ocurrido un error al comprobar tu estado de verificación. Por favor, intenta de nuevo más tarde. Si el problema persiste, por favor ejecuta el comando /ayuda.
    `);
  }
});

//**************************************************************************************************************************************** */
































// Manejador de acción para el botón "Regresar"
bot.action('menu_principal', (ctx) => {
  // Enviamos el menú principal al usuario
  return ctx.reply('Por favor selecciona una opción:', menuOptions);
});

// Manejador de acción para el botón "Salir"
bot.action('salir', (ctx) => {
  // Muestra un mensaje de despedida y agradecimiento
  ctx.reply('No dudes en regresar a nuestro menú principal cuando quieras. Estamos aquí para ayudarte en lo que necesites. ¡Gracias por usar FirewallIds! 😊');
  
  // Cierra el menú de comandos
  ctx.editMessageText('Has cerrado el menú de comandos.');
});



bot.launch();
