require('dotenv').config();

const { Telegraf, TelegramError, Markup } = require('telegraf');

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
const { despedida } = require ('./KYC/kycpresentacion')
const { insertKycData } = require ('./KYC/kyctabla')





//Conexion del BOT
const bot = new Telegraf(process.env.BOT_TOKEN, { allow_callback_query: true });




//Variables de Entorno *********
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
    await menuKYC.mostrarMenu(ctx);

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
//Acepto los terminos
bot.action('aceptoTerminos', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
  await kycMenu(ctx);
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

//Acciones de los Botones de preguntas del KYC
//                                                   Nombre Completo
bot.action('insertName', (ctx) => {
  const chatId = ctx.chat.id;
  ctx.reply('Por favor, proporciona tu nombre completo.');

  bot.hears(/\w.+/i, async (ctx) => {
    const userId = BigInt(ctx.from.id);
    const name = ctx.message.text;
  
    try {
      await insertKycData(userId, name);
      await ctx.telegram.sendMessage(chatId, '¡Gracias por proporcionar tu nombre!');
    } catch (err) {
      console.error('Error insertando datos KYC:', err.message);
      await ctx.telegram.sendMessage(chatId, 'Lo siento, ha habido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.');
  
      // Registra el error en un archivo de registro de errores
      const errorMsg = `${new Date().toISOString()} - Error insertando datos KYC: ${err.message}\n`;
      fs.appendFileSync('error.log', errorMsg);
    }
  });
});








































// Cuando el usuario ejecuta el comando /start en el chat privado del bot

bot.start((ctx) => {
  // Obtener el ID y nombre del usuario
  const id = ctx.from.id;
  const nombre = ctx.from.first_name;

 // Enviar mensaje de bienvenida
  ctx.reply(`👋 Hola ${nombre} 📩 !\n\n🆔 Este es tu ID en Telegram: ${id}\n\n🛡️ ¡Bienvenido a FirewallIds! Somos un servicio de seguridad en línea que se enfoca en la protección de tus datos personales y la prevención de actividades cibernéticas maliciosas.\n\n🤖 Puedo ayudarte si ejecutas el comando /ayuda.`);
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
