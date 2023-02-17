require('dotenv').config();

const { Telegraf } = require('telegraf');
const { menuOptions } = require('./commands/menu');
const { comandosOptions } = require('./commands/comandos/comandos');
const { md } = require('telegram-escape')

const bot = new Telegraf(process.env.BOT_TOKEN);

// Cuando el usuario ejecuta el comando /start en el chat privado del bot
bot.start(async (ctx) => {
  const chatType = ctx.chat.type
  const firstName = ctx.message.from.first_name
  const userId = ctx.message.from.id

  if (chatType === 'private') {
    const message = md`*Hola, ${escapeMarkdown(firstName)}! 👋*\n\n` +
      `Tu ID de Telegram es: \`${userId}\`\n\n` +
      `*Bienvenid@ a Reputación Plus (BR+)!🤖*\n\n` +
      `Nuestro objetivo principal es proteger a los grupos de Telegram contra la delincuencia cibernética. Además, también brinda una gestión segura para administrar los grupos y verificación de usuarios a través de KYC (Conozca a su Cliente).\n\n` +
      `Si estás verificado en nuestro sistema, también tendrás acceso a servicios avanzados para negociaciones. 🚀\n\n` +
      `Para obtener más información sobre lo que podemos ofrecerte, escribe /ayuda.\n\n` +
      `¿En qué podemos ayudarte hoy?👨‍💼`

    await ctx.replyWithMarkdown(message)
  } else {
    // Si el comando /start es ejecutado en un grupo, responder por privado al usuario
    await ctx.reply('Hola! Este comando solo puede ser ejecutado en el chat privado con el bot.')
  }
})


// Comando para mostrar el menú inline
bot.command('ayuda', async (ctx) => {
  return ctx.reply('Por favor selecciona una opción:', menuOptions);
});

// Manejador de comando /comandos
bot.command('comandos', (ctx) => {
  return ctx.reply('Aquí están los comandos:', comandosOptions);
});


bot.launch();
