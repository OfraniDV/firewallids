require('dotenv').config();

const { Telegraf, TelegramError } = require('telegraf');

const { menuOptions } = require('./commands/menu');
const { comandosOptions } = require('./commands/menus/comandos');
const { comandosUsuariosOptions } = require('./commands/menus/usuarios');
const { administradoresOptions } = require('./commands/menus/admins');




const { md, escapeMarkdown } = require('telegram-escape')

const bot = new Telegraf(process.env.BOT_TOKEN);

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

// Manejador de comando /comandos
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

// Manejador de acción para el botón "Regresar" del menú de usuarios
bot.action('menu_anterior', (ctx) => {
  ctx.editMessageText('Regresando al menú de comandos...', comandosOptions);
});

// Manejador de acción para el botón "Para Adminstradores"
bot.action('comandos_administradores', (ctx) => {
  ctx.editMessageText('Estos son los comandos Extra para Administradores:', administradoresOptions);
});













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
