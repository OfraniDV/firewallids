require('dotenv').config()
const { Telegraf } = require('telegraf')
const menu = require('./commands/menu/menu')

const bot = new Telegraf(process.env.BOT_TOKEN)

// Cuando el usuario ejecuta el comando /start en el chat privado del bot
bot.start(async (ctx) => {
  const chatType = ctx.chat.type
  const firstName = ctx.message.from.first_name
  const userId = ctx.message.from.id

  if (chatType === 'private') {
    const message = `Hola, ${firstName}! 👋\n` +
      `Tu ID de Telegram es: ${userId}\n\n` +
      `Bienvenid@ a Reputación Plus (BR+)!🤖 \n\n` +
      `Nuestro objetivo principal es proteger a los grupos de Telegram contra la delincuencia cibernética. Además, también brinda una gestión segura para administrar los grupos y verificación de usuarios a través de KYC (Conozca a su Cliente).\n\n` +
      `Si estás verificado en nuestro sistema, también tendrás acceso a servicios avanzados para negociaciones. 🚀\n\n` +
      `Para obtener más información sobre lo que podemos ofrecerte, escribe /ayuda.\n\n` +
      `¿En qué podemos ayudarte hoy?👨‍💼`

    await ctx.reply(message)
  } else {
    // Si el comando /start es ejecutado en un grupo, responder por privado al usuario
    await ctx.reply('Hola! Este comando solo puede ser ejecutado en el chat privado con el bot.')
  }
})

// Cuando el usuario ejecuta el comando /ayuda en el chat privado del bot
bot.command('ayuda', async (ctx) => {
  await ctx.reply('¡Claro! Aquí tienes las opciones que puedes elegir:', menu.keyboard, {
    parse_mode: 'Markdown',
    resize_keyboard: true,
  })
})

bot.launch()
