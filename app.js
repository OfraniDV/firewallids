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
const { listarUsuariosEnListaNegra } = require('./listanegra/listarlistanegra');

// IMPORTACION para el KYC 
const { kycMenu } = require('./KYC/kycmenu')
const { mostrarTerminos, aceptoTerminos } = require ('./KYC/kycterminos')
const { getUserResponses } = require('./KYC/kycrespuestas');
const { mostrarMenu, despedida, iniciarProceso } = require('./KYC/kycpresentacion');
const { lsverificadosCommand } = require('./KYC/listarverificados');

// Importacion para la Lista Negra
// Importamos la función cleanGroups desde el archivo donde la definiste
const { cleanGroups } = require('./listanegra/clean');

// Actualizar a BRPlus
require('./KYC/updatekyc');
require('./KYC/updateuser');




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

////    **** LISTA NEGRA ****              ////
// Creamos el comando "/clean" y lo limitamos solo a los administradores de la lista negra
bot.command('clean', async (ctx) => {
  const admin = await pool.query('SELECT * FROM listanegra_administradores WHERE id = $1', [ctx.from.id]);

  if (!admin.rows[0]) {
    ctx.reply('Lo siento, no estás autorizado para ejecutar este comando. Solo los administradores de la lista negra pueden ejecutar este comando.');
    return;
  }

  // Enviamos un mensaje al usuario que ejecutó el comando
  ctx.replyWithChatAction('typing');
  setTimeout(async () => {
    await ctx.reply(`🧹 **¡Atención!** Se iniciará una limpieza global en breve. Este proceso puede tardar unos minutos, por favor ten paciencia. 💪`, {
      parse_mode: 'Markdown',
    });
    // Llamamos a la función cleanGroups para realizar la limpieza
    await cleanGroups(ctx);
  }, 1000);
});





// ****************          ****  // KYC //  *****       ************
//Botón KYC del Primer menu de COMANDOS PARA USUARIOS
bot.action('kyc', async (ctx) => {
  // Verifica si el botón se está ejecutando en el chat privado con el bot
  if (ctx.chat.type !== 'private') {
    // Si no es el chat privado con el bot, muestra un mensaje de acceso denegado
    await ctx.answerCbQuery('🚫 Acceso denegado! Este botón solo está disponible en el chat privado con el bot');
    return;
  }

  // Borra el mensaje actual y muestra el menú KYC
  await ctx.deleteMessage();
  await mostrarMenu(ctx);
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
  const userId = BigInt(ctx.from.id);
  console.log('User ID:', userId);

  // Verificar si el usuario ya existe en la tabla
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [userId]);

  if (user.rows.length === 0) {
    // Si el usuario no existe en la tabla, insertar una nueva fila
    await pool.query('INSERT INTO kycfirewallids (user_id, terms_accepted) VALUES ($1, true)', [userId]);
  } else {
    // Si el usuario ya existe en la tabla, actualizar la columna de términos
    await pool.query('UPDATE kycfirewallids SET terms_accepted = true WHERE user_id = $1', [userId]);
  }

  ctx.answerCbQuery();
  ctx.deleteMessage();
  ctx.reply('¡Gracias por aceptar los términos y condiciones! Por favor, ingrese la siguiente información para completar el proceso KYC:', kycMenu);
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
//                          Acciones y Comandos del KYC               /////////////
///////////////////////////////////////////////////////////////////////////////////

// Listar Verificados
bot.command('lsverificados', async (ctx) => {
  try {
    const adminId = ctx.from.id;
    const isAdmin = await pool.query(`SELECT id FROM listanegra_administradores WHERE id = ${adminId}`);
    
    if (isAdmin.rowCount > 0) {
      // Si el usuario es un administrador, ejecuta el comando lsverificadosCommand
      await lsverificadosCommand(ctx);
    } else {
      // Si no es un administrador, envía un mensaje de error
      await ctx.reply('ACCESO DENEGADO\N No tienes permiso para ejecutar este comando');
    }
  } catch (error) {
    console.error(`Error al ejecutar el comando /lsverificados: ${error}`);
    await ctx.reply('Ocurrió un error al ejecutar el comando');
  }
});

// Listar los usuarios en lista negra
bot.command('lslistanegra', async (ctx) => {
  try {
    const adminId = ctx.from.id;
    const isAdmin = await pool.query(`SELECT id FROM listanegra_administradores WHERE id = ${adminId}`);
    
    if (isAdmin.rowCount > 0) {
      // Si el usuario es un administrador, ejecuta el comando listarUsuariosEnListaNegra
      await ctx.reply('Estamos generando la lista de usuarios en lista negra, esto puede tardar unos momentos. Por favor, ten paciencia.');
      await listarUsuariosEnListaNegra(ctx);
    } else {
      // Si no es un administrador, envía un mensaje de error
      await ctx.reply('ACCESO DENEGADO\N No tienes permiso para ejecutar este comando');
    }
  } catch (error) {
    console.error(`Error al ejecutar el comando /lslistanegra: ${error}`);
    await ctx.reply('Ocurrió un error al ejecutar el comando');
  }
});




//                                               Nombre Completo
// Acción para pedir el nombre completo del usuario
bot.action('insertName', async (ctx) => {
  const firstName = ctx.from.first_name;
  const userId = ctx.from.id;

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

  ctx.reply(`📝 ¡${firstName}!, para cumplir con el proceso KYC, por favor proporciona tu nombre real como aparece en tu documento de identidad. Ejecuta el siguiente comando /nombre seguido de tu nombre completo.`);
});



// Comando para guardar el nombre completo del usuario
bot.command('nombre', async (ctx) => {
  const userId = ctx.from.id;
  const name = ctx.message.text.substring(7).trim();

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

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
bot.action('insertIdentityNumber', async (ctx) => {
  const userId = ctx.from.id;

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

  const firstName = ctx.from.first_name;
  ctx.reply(`🆔 ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu número de identidad real. Ejecuta el siguiente comando /identidad seguido de tu número de identidad sin espacios ni guiones. Por ejemplo: /identidad ************.`);
});



// Comando para guardar el número de identidad del usuario
bot.command('identidad', async (ctx) => {
  const userId = ctx.from.id;
  const identityNumber = ctx.message.text.substring(10).replace(/ /g, '');

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

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
bot.action('insertPhoneNumber', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);

    if (user.rows[0] && user.rows[0].approved) {
      return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
    }

    const firstName = ctx.from.first_name;
    ctx.reply(`📞 ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu número de teléfono. Ejecuta el siguiente comando /telefono seguido de tu número de teléfono con el código de país sin espacios ni guiones. Por ejemplo: /telefono +1234567890.`);
  } catch (error) {
    console.error(error);
    ctx.reply(`Lo siento, ha ocurrido un error al obtener la información de KYC.`);
  }
});


// Comando para guardar el número de teléfono del usuario
bot.command('telefono', async (ctx) => {
  const userId = ctx.from.id;
  const phoneNumber = ctx.message.text.substring(9).replace(/ /g, '');

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

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
bot.action('insertEmail', async (ctx) => {
  const firstName = ctx.from.first_name;
  const userId = ctx.from.id;

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

  ctx.reply(`📧 ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu dirección de correo electrónico. Ejecuta el siguiente comando /correo seguido de tu dirección de correo electrónico. Por ejemplo: /correo ejemplo@ejemplo.com.`);
});


// Comando para guardar la dirección de correo electrónico del usuario
bot.command('correo', async (ctx) => {
  const userId = ctx.from.id;
  const email = ctx.message.text.substring(8);

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

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
bot.action('insertAddress', async (ctx) => {
  const firstName = ctx.from.first_name;
  const userId = ctx.from.id;

  // Verificar si el usuario tiene KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

  ctx.reply(`🏠 ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu dirección. Ejecuta el siguiente comando /direccion seguido de tu dirección. Por ejemplo: /direccion Calle 123 # 45 - 67.`);
});


// Comando para guardar la dirección del usuario
bot.command('direccion', async (ctx) => {
  const userId = ctx.from.id;
  const address = ctx.message.text.substring(11);

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

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
bot.action('insertMunicipality', async (ctx) => {
  const firstName = ctx.from.first_name;

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [ctx.from.id]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

  ctx.reply(`🏙️ ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu municipio. Ejecuta el siguiente comando /municipio seguido de tu municipio. Por ejemplo: /municipio Medellín.`);
});

// Comando para guardar el municipio del usuario
bot.command('municipio', async (ctx) => {
  const userId = ctx.from.id;
  const municipality = ctx.message.text.substring(10);

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

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
bot.action('insertProvince', async (ctx) => {
  const firstName = ctx.from.first_name;

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [ctx.from.id]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

  ctx.reply(`🌅 ¡${firstName}! Para continuar con el proceso KYC, por favor proporciona tu provincia. Ejecuta el siguiente comando /provincia seguido de tu provincia. Por ejemplo: /provincia Antioquia.`);
});

// Comando para guardar la provincia del usuario
bot.command('provincia', async (ctx) => {
  const userId = ctx.from.id;
  const province = ctx.message.text.substring(10);

  // Verificar que el usuario no tenga KYC aprobado
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Tu KYC ya ha sido revisado y aprobado por lo que no puedes editar tus datos. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
  }

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
// Función que maneja el botón de acción "kycarchivos"
bot.action('kycarchivos', async (ctx) => {
  // Obtener información del usuario
  const userId = ctx.from.id;
  const user = await pool.query('SELECT * FROM kycfirewallids WHERE user_id=$1', [userId]);

  // Verificar si el usuario ya ha sido aprobado
  if (user.rows[0] && user.rows[0].approved) {
    return ctx.reply('Lo siento, tus informaciones ya fueron aprobadas. No puedes editar tus informaciones. Si necesitas hacer alguna actualización, por favor contacta con soporte.');
  }

  // Mensaje con instrucciones para enviar los archivos de KYC
  const mensaje = `
    Para cumplir con los requisitos de KYC, por favor siga estas instrucciones:

    1. Comprima las siguientes fotos en un archivo ZIP o RAR:
      - Documento de identidad (ambas caras).
      - Selfie sosteniendo una hoja en blanco con su firma, la fecha actual, el nombre del bot y su documento de identidad enfocado en frente del papel.
      - Foto de una transferencia o depósito en el banco donde se vea el número de la sucursal de su banco y aparezca su nombre igual que en su documento.

    2. Envíe el archivo comprimido a través de este bot usando el comando /kycarchivos.

    Asegúrese de que todas las fotos estén enfocadas y centradas correctamente antes de enviarlas. Si tiene algún problema con la carga de archivos, contáctenos en nuestro soporte al cliente.

    Gracias por su cooperación.`;

  // Enviar el mensaje al usuario
  await ctx.reply(mensaje);
});







///   ***** enviar el archivo comprimido *****///////
bot.command('kycarchivos', async (ctx) => {
  console.log(`Comando /kycarchivos recibido de ${ctx.from.username} (ID: ${ctx.from.id})`);
  
  const userId = ctx.from.id;

  // Consultamos la tabla kycfirewallids para ver si el usuario ya existe
  const res = await pool.query(`SELECT * FROM kycfirewallids WHERE user_id = ${userId}`);
  
  // Si no existe el usuario, lo creamos
  if (res.rowCount === 0) {
    await pool.query(`INSERT INTO kycfirewallids (user_id) VALUES (${userId})`);
    
    // Enviamos mensaje al usuario solicitando sus archivos
    ctx.reply('Por favor envía tus fotos en un archivo comprimido en zip o rar');
    console.log(`Solicitando archivos a ${ctx.from.username} (ID: ${ctx.from.id})`);
    return;
  }
  
  // Si el KYC del usuario está en proceso, enviamos un mensaje informándole
  if (res.rows[0].pending === true) {
    ctx.reply('Tu KYC ya está en análisis, por favor espera.');
    console.log(`KYC de ${ctx.from.username} (ID: ${ctx.from.id}) ya está en análisis`);
    return;
  }
  
  // Si el KYC del usuario no está en proceso, le pedimos que envíe sus archivos
  ctx.reply('Por favor envía tus fotos en un archivo comprimido en zip o rar');
  console.log(`Solicitando archivos a ${ctx.from.username} (ID: ${ctx.from.id})`);
});

bot.on('document', async (ctx) => {
  const userId = ctx.from.id;
  const file = ctx.message.document;

  // Verificamos que el archivo sea un archivo comprimido en rar o zip
  const extension = file.file_name.split('.').pop();
  if (extension !== 'rar' && extension !== 'zip') {
    ctx.reply('Lo siento, solo se permiten archivos comprimidos en rar o zip.');
    console.log(`Archivo inválido recibido de ${ctx.from.username} (ID: ${ctx.from.id})`);
    return;
  }

  // Descargamos el archivo y lo guardamos en la base de datos
  const fileLink = await ctx.telegram.getFileLink(file.file_id);
  const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data);

  // Convertimos el archivo en un objeto tipo bytea para almacenarlo en la base de datos
  const fileBytes = new Uint8Array(buffer);
  const bytea = Buffer.from(fileBytes).toString('base64');

  // Actualizamos la tabla kycfirewallids para almacenar el archivo
  await pool.query(`UPDATE kycfirewallids SET kycarchivos = decode('${bytea}', 'base64') WHERE user_id = ${userId}`);
  
  ctx.reply('¡Gracias por enviar tus archivos! Tu KYC está en proceso de análisis. Te notificaremos cuando esté listo.');
  console.log(`Archivo recibido de ${ctx.from.username} (ID: ${ctx.from.id}) y guardado en la base de datos.`);
});


















  

//                              ENLACE DE SU CUENTA DE FACEBOOK

// Acción para pedir la cuenta de Facebook del usuario
bot.action('insertFacebook', async (ctx) => {
  const firstName = ctx.from.first_name;

  // Consultar el estado del KYC del usuario en la base de datos
  const userId = ctx.from.id;
  const kycResult = await pool.query('SELECT approved FROM kycfirewallids WHERE user_id = $1', [userId]);

  if (kycResult.rows.length > 0 && kycResult.rows[0].approved) {
    ctx.reply('Tu KYC ya fue revisado y aprobado. No puedes editar tus informaciones. Si deseas hacer alguna actualización, por favor, entra en contacto con soporte.');
    return;
  }

  ctx.reply(`👤 ¡Hola ${firstName}! Para continuar con el proceso KYC, por favor proporciona tu cuenta de Facebook. Ejecuta el siguiente comando /facebook seguido de tu nombre de usuario. Por ejemplo: /facebook juan.perez`);
});

// Comando para guardar la cuenta de Facebook del usuario
bot.command('facebook', async (ctx) => {
  const userId = ctx.from.id;
  const facebook = ctx.message.text.substring(9);

  // Consultar el estado del KYC del usuario en la base de datos
  const kycResult = await pool.query('SELECT approved FROM kycfirewallids WHERE user_id = $1', [userId]);

  if (kycResult.rows.length > 0 && kycResult.rows[0].approved) {
    ctx.reply('Tu KYC ya fue revisado y aprobado. No puedes editar tus informaciones. Si deseas hacer alguna actualización, por favor, entra en contacto con soporte.');
    return;
  }

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
  try {
    const userId = ctx.from.id;
    const query = `
      SELECT name, identity_number, phone_number, email, address, municipality, province, kycarchivos, facebook, approved
      FROM kycfirewallids
      WHERE user_id = ${userId.toString()}
    `;
    const result = await pool.query(query);
    const user = result.rows[0];

    if (!user) {
      ctx.reply(`Lo siento, no se encontró información de KYC para su usuario. Por favor, envíe su información de KYC a través del comando /kyc.`);
      return;
    }

    // Comprobar si el usuario ya ha sido aprobado
    if (user.approved) {
      ctx.reply('Tu KYC ya ha sido revisado y aprobado. Si necesitas hacer algún cambio, ponte en contacto con el soporte.');
      return;
    }
    // Comprobar si se han enviado todos los campos importantes
    const name = user.name || 'Falta esta información';
    const identity_number = user.identity_number || 'Falta esta información';
    const phone_number = user.phone_number || 'Falta esta información';
    const email = user.email || 'Falta esta información';
    const address = user.address || 'Falta esta información';
    const municipality = user.municipality || 'Falta esta información';
    const province = user.province || 'Falta esta información';
    const kycarchivos = user.kycarchivos;
    const facebook = user.facebook || '';

    // Comprobar si falta alguna información importante
    const hasAllInfo = name !== 'Falta esta información'
      && identity_number !== 'Falta esta información'
      && phone_number !== 'Falta esta información'
      && email !== 'Falta esta información'
      && address !== 'Falta esta información'
      && municipality !== 'Falta esta información'
      && province !== 'Falta esta información';

    // Mostrar mensaje si falta alguna información importante
    if (!hasAllInfo) {
      let missingInfoMessage = 'Lo siento, falta la siguiente información en su KYC:\n\n';
      if (name === 'Falta esta información') {
        missingInfoMessage += '- Nombre\n';
      }
      if (identity_number === 'Falta esta información') {
        missingInfoMessage += '- Número de identidad\n';
      }
      if (phone_number === 'Falta esta información') {
        missingInfoMessage += '- Número de teléfono\n';
      }
      if (email === 'Falta esta información') {
        missingInfoMessage += '- Correo electrónico\n';
      }
      if (address === 'Falta esta información') {
        missingInfoMessage += '- Dirección\n';
      }
      if (municipality === 'Falta esta información') {
        missingInfoMessage += '- Municipio\n';
      }
      if (province === 'Falta esta información') {
        missingInfoMessage += '- Provincia\n';
      }
      ctx.reply(missingInfoMessage);
      return;
    }

    // Convertir kycarchivos de bytea a archivo real legible para humanos
const kycBuffer = Buffer.from(kycarchivos, 'binary');
const kycFileName = `kyc-${userId}.zip`;
fs.writeFileSync(kycFileName, kycBuffer);
    // Crear un reporte con la información obtenida y enviarlo al usuario en su chat privado si se han enviado todos los campos, de lo contrario, mostrar un mensaje
if (hasAllInfo) {
  const reportMsg = `📝 *Solicitud de verificación de KYC*\n\n` +
    `Fecha: ${new Date().toLocaleString('es-CU', { timeZone: 'America/Havana' })}\n\n` +
    `El usuario de alias @${ctx.from.username} y ID ${ctx.from.id} solicita que se revise su KYC:\n\n` +
    `Nombre: ${name}\n` +
    `Número de identidad: ${identity_number}\n` +
    `Número de teléfono: ${phone_number}\n` +
    `Correo electrónico: ${email}\n` +
    `Dirección: ${address}\n` +
    `Municipio: ${municipality}\n` +
    `Provincia: ${province}\n` +
    `Facebook: ${facebook}\n`;

  const reportMsgSent = await ctx.telegram.sendMessage(ctx.from.id, `¿La siguiente información es correcta?\n\n${reportMsg}`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Sí, todo correcto',
            callback_data: 'kyc_approval'
          },
          {
            text: 'No, necesito editar',
            callback_data: 'kyc_edit'
          }
        ]
      ]
    }
  });

  // Enviar el archivo KYC comprimido junto con un mensaje
  const kycFileSent = await ctx.telegram.sendDocument(ctx.from.id, { source: kycFileName }, { caption: 'Aquí está su KYC.' });

  // Eliminar los archivos generados del disco
  fs.unlinkSync(kycFileName);
} else {
  ctx.reply('Para enviar su informe al departamento del KYC, debe completar todos los campos de información solicitados. Por favor, revise y complete la información que falta.');
}
} catch (error) {
  console.error(error);
  ctx.reply(`Lo siento, ha ocurrido un error al obtener la información de KYC.`);
  }
  })


// Si todo esta bien se envia al grupo de revisiones


bot.action('kyc_approval', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const query = `
      SELECT name, identity_number, phone_number, email, address, municipality, province, kycarchivos, facebook, pending, approved
      FROM kycfirewallids
      WHERE user_id = ${userId.toString()}
    `;
    const result = await pool.query(query);
    const user = result.rows[0];

    if (!user) {
      ctx.reply(`Lo siento, no se encontró información de KYC para su usuario. Por favor, envíe su información de KYC a través del comando /kyc.`);
      return;
    }

    const pending = user.pending;
    const approved = user.approved;

    if (pending) {
      ctx.reply("Ya se ha enviado su solicitud al departamento de revisiones. Por favor, espere a que su solicitud sea revisada. Si tiene alguna pregunta, por favor, póngase en contacto con el grupo de soporte técnico. Tenga en cuenta que la revisión puede tardar hasta 48 horas.");
      return;
    } else if (approved) {
      ctx.reply("¡Su KYC ya ha sido aprobado! Si necesita cambiar sus datos, por favor, póngase en contacto con el grupo de soporte técnico.");
      return;
    }

    // Convertir kycarchivos de bytea a archivo real legible para humanos
    const kycBuffer = Buffer.from(user.kycarchivos, 'binary');
    const kycFileName = `kyc-${userId}.zip`;
    fs.writeFileSync(kycFileName, kycBuffer);

    // Crear un reporte con la información obtenida y enviarlo al grupo de administradores
    const reportMsg = `ATENCIÓN\n\nEn la fecha ${new Date().toLocaleString('es-CU', { timeZone: 'America/Havana' })}, el usuario de alias @${ctx.from.username} y ID ${ctx.from.id} está solicitando que se revise su KYC:\n\n` +
      `Nombre: ${user.name}\n` +
      `Número de identidad: ${user.identity_number}\n` +
      `Número de teléfono: ${user.phone_number}\n` +
      `Correo electrónico: ${user.email}\n` +
      `Dirección: ${user.address}\n` +
      `Municipio: ${user.municipality}\n` +
      `Provincia: ${user.province}\n` +
      `Facebook: ${user.facebook}\n\n` +
      `Para aprobar este KYC, ejecute el comando /aprobarkyc <ID_USUARIO>. Para rechazarlo, use el comando /rechazarkyc <ID_USUARIO>.`;

    const kycFileSent = await ctx.telegram.sendDocument(process.env.ID_GROUP_VERIFY_KYC, { source: kycFileName }, { caption: reportMsg });

    // Eliminar los archivos generados del disco
    fs.unlinkSync(kycFileName);

    // Actualizar la columna "pending" a "true" en la tabla "kycfirewallids"
    const updateQuery = `
      UPDATE kycfirewallids
      SET pending = true
      WHERE user_id = ${userId}
    `;
    await pool.query(updateQuery);

    ctx.reply("¡Su solicitud de verificación de KYC ha sido enviada al departamento de revisiones para su revisión! Por favor, espere a que su solicitud sea revisada. Si tiene alguna pregunta, por favor, póngase en contacto con el grupo de soporte técnico.");
  } catch (error) {
    console.error(error);
    ctx.reply(`Lo siento, ha ocurrido un error al enviar su solicitud de verificación de KYC. Por favor, inténtelo de nuevo más tarde o póngase en contacto con el grupo de soporte técnico.`);
  }
});





// Si falta algo
bot.action('kyc_edit', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const query = `
      SELECT pending
      FROM kycfirewallids
      WHERE user_id = ${userId}
    `;
    const result = await pool.query(query);
    const pending = result.rows[0].pending;

    if (pending) {
      // Actualizar la columna "pending" a "null" en la tabla "kycfirewallids"
      const updateQuery = `
        UPDATE kycfirewallids
        SET pending = null
        WHERE user_id = ${userId}
      `;
      await pool.query(updateQuery);

      ctx.reply("¡Listo! Puedes enviar tus informaciones nuevamente.");
    } else {
      ctx.reply("Para editar tus informaciones, toca el boton en el menu o escribe el comando que corresponde si necesitas ayuda escribe a Soporte.");
    }
  } catch (error) {
    console.error(error);
    ctx.reply(`Lo siento, ha ocurrido un error al obtener la información de KYC.`);
  }
});









//  ***************Comando para los Administradores Aprobar o Rechazar el KYC ***************
// APROBAR KYC
async function aprobarKYC(ctx) {
  const kycId = ctx.message.text.match(/\d+/g)[0];
  const adminId = BigInt(ctx.from.id); // convertir el ID del admin a BigInt

  try {
    // Buscar la solicitud de KYC por el ID
    const kyc = await pool.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [kycId]);
    if (kyc.rowCount === 0) {
      console.error(`No se pudo encontrar la solicitud de KYC con ID ${kycId}`);
      return ctx.reply('Lo siento, ese usuario no se encuentra pendiente de aprobación.');
    }

    // Verificar que el administrador tenga permiso para aprobar la solicitud de KYC
    const admin = await pool.query('SELECT * FROM listanegra_administradores WHERE id = $1', [adminId]);
    if (admin.rowCount === 0) {
      console.error(`El administrador con ID ${adminId} no está autorizado para aprobar la solicitud de KYC con ID ${kycId}`);
      return ctx.reply('Lo siento, no estás autorizado para aprobar la solicitud de KYC.');
    }

    // Verificar si la solicitud de KYC ya fue aprobada o rechazada anteriormente
    const approved = kyc.rows[0].approved;
    const rejected = kyc.rows[0].rejected;
    if (approved === true) {
      console.error(`El KYC con ID ${kycId} ya fue aprobado anteriormente.`);
      return ctx.reply('Lo siento, ese KYC ya fue aprobado anteriormente.');
    } else if (rejected === true) {
      console.error(`El KYC con ID ${kycId} ya fue rechazado anteriormente.`);
      return ctx.reply('Lo siento, ese KYC ya fue rechazado anteriormente.');
    }

    // Verificar si la solicitud de KYC está pendiente de aprobación
    const pending = kyc.rows[0].pending;
    if (pending !== true) {
      console.error(`El KYC con ID ${kycId} no está pendiente de aprobación.`);
      return ctx.reply('Lo siento, ese usuario no se encuentra pendiente de aprobación.');
    }

    // Actualizar la fila correspondiente en la tabla kycfirewallids
    const userId = kyc.rows[0].user_id;
    await pool.query('UPDATE kycfirewallids SET approved = true, admin_id = $1, pending = null, rejected = false WHERE user_id = $2', [adminId, userId]);

    // Notificar al usuario que la solicitud de KYC ha sido aprobada
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


// Comando para rechazar el KYC
//FUNCION RECHAZAR KYC
async function rechazarKYC(ctx) {
  const kycId = ctx.message.text.match(/\d+/g)[0];
  const adminId = BigInt(ctx.from.id); // convertir el ID del admin a BigInt

  try {
    // Buscar la solicitud de KYC por el ID
    const kyc = await pool.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [kycId]);
    if (kyc.rowCount === 0) {
      console.error(`No se pudo encontrar la solicitud de KYC con ID ${kycId}`);
      return ctx.reply('No se pudo encontrar la solicitud de KYC con el ID proporcionado.');
    }

    const pending = kyc.rows[0].pending;
    const approved = kyc.rows[0].approved;
    const rejected = kyc.rows[0].rejected;

    if (pending === false) {
      console.error(`El KYC con ID ${kycId} no está pendiente de aprobación`);
      return ctx.reply('El KYC con el ID proporcionado no está pendiente de aprobación.');
    }

    if (approved === true) {
      console.error(`El KYC con ID ${kycId} ya fue aprobado anteriormente`);
      return ctx.reply('El KYC con el ID proporcionado ya fue aprobado anteriormente.');
    }

    if (rejected === true) {
      console.error(`El KYC con ID ${kycId} ya fue rechazado anteriormente`);
      return ctx.reply('El KYC con el ID proporcionado ya fue rechazado anteriormente.');
    }

    // Actualizar la fila correspondiente en la tabla kycfirewallids
    const userId = kyc.rows[0].user_id;
    await pool.query('UPDATE kycfirewallids SET rejected = true, pending = null, approved = false, admin_id = $1 WHERE user_id = $2', [adminId, userId]);

    // Notificar al administrador que la solicitud de KYC ha sido rechazada
    await ctx.reply(`KYC con ID ${kycId} rechazado exitosamente.`);

    // Notificar al usuario que su solicitud ha sido rechazada
    const chatMember = await bot.telegram.getChatMember(ID_GROUP_VERIFY_KYC, userId);
    if (chatMember && chatMember.user) {
      const userFirstName = chatMember.user.first_name;
      const userLastName = chatMember.user.last_name || '';
      await bot.telegram.sendMessage(userId, `Lo sentimos ${userFirstName} ${userLastName}, pero tu KYC ha sido rechazado. Por favor, inténtalo de nuevo con la información correcta.`);
    }

  } catch (err) {
    console.error(`Error rechazando KYC: ${err}`);
    await ctx.reply('Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.');
  }
}

bot.command('rechazarkyc', rechazarKYC);




//        *** ACTUALIZAR EL KYC DE FIREWALLIDS EN BR+ ***
bot.command('actualizar', async (ctx) => {
  const user_id = ctx.from.id;
  await actualizarDatosUsuario(user_id);
  ctx.reply('Se actualizaron tus datos correctamente');
});



















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
