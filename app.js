require('dotenv').config();

const { Telegraf, TelegramError } = require('telegraf');

const { menuOptions } = require('./commands/menu');
const { comandosOptions } = require('./commands/comandos/comandos');
const { comandosUsuariosOptions } = require('./commands/comandos/usuarios');
const { administradoresOptions } = require('./commands/comandos/admins');
const { negociosOptions } = require('./commands/negocios/negocios');

const { pool } = require('./psql/db');


const { md, escapeMarkdown } = require('telegram-escape')

const bot = new Telegraf(process.env.BOT_TOKEN);
const urlKyc = process.env.URL_KYC;
const urlWeb = process.env.URL_WEB;
const gDenun = process.env.ID_GROUP_DENUNCIAS;
const gRecla = process.env.ID_GROUP_RECLAMAR;
const gSuppt = process.env.ID_GROUP_SUPPORT;
const canalD = process.env.ID_CHANNEL_REPORTS;
const gRecom = process.env.ID_GROUP_RECOMEND;
const nosotr = process.env.NOSOTROS;
const rules  = process.env.BOT_RULES;




 
// Cuando el usuario ejecuta el comando /start en el chat privado del bot
bot.start(async (ctx) => {
  const chatType = ctx.chat.type
  const firstName = ctx.message.from.first_name
  const userId = ctx.message.from.id

  if (chatType === 'private') {
    const message = md`Hola cómo estás, ${escapeMarkdown(firstName)}! 👋\n\n` +
      `Tu ID en Telegram es: \`${userId}\`\n\n` +
      `Bienvenido a Reputación Plus (BR+)!🤖\n\n` +
      `Nuestro objetivo principal es proteger a los grupos de Telegram contra la delincuencia cibernética. Además, brindamos una gestión segura para administrar los grupos y verificación de usuarios a través de KYC (Conozca a su Cliente).\n\n` +
      `Si estás verificado en nuestro sistema, también tendrás acceso a servicios avanzados para negociaciones. 🚀\n\n` +
      `Si necesitas ayuda, escribe el comando /ayuda.\n\n` +
      `¿En qué podemos ayudarte hoy?👨‍💼`

    await ctx.replyWithMarkdown(message)
  } else {
    // Si el comando /start es ejecutado en un grupo, responder por privado al usuario
    await ctx.reply('Hola! Este comando solo puede ser ejecutado en el chat privado con el bot.')
  }
})


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
bot.action('menu_anterior', (ctx) => {
  ctx.editMessageText('Regresando al menú de comandos...', comandosOptions);
});

// Manejador de acción para el botón "Para Adminstradores"
bot.action('comandos_administradores', (ctx) => {
  ctx.editMessageText('Estos son los comandos Extra para Administradores:', administradoresOptions);
});


//Botón KYC Temporalmente, luego lo hare con Telegram Pasport
bot.action('kyc', (ctx) => {
    // Redireccionar a la URL de KYC
  ctx.replyWithHTML(`Para realizar KYC, da clic <a href="${urlKyc}">aquí</a>.`, { disable_web_page_preview: false });
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
  ctx.reply('No dudes en regresar a nuestro menú principal cuando quieras. Estamos aquí para ayudarte en lo que necesites. ¡Gracias por usar Reputación Plus (BR+)! 😊');
  
  // Cierra el menú de comandos
  ctx.editMessageText('Has cerrado el menú de comandos.');
});



bot.launch();
