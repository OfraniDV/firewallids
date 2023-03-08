require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN, { allow_callback_query: true });

bot.start((ctx) => {
  const chatId = ctx.chat.id;
  const botId = bot.botInfo.id;
  
  // Obtener la lista de chats donde está el usuario actual
  bot.telegram.getChatMember(chatId, botId).then((member) => {
    if (member.status === 'member' || member.status === 'administrator') {
      // Si el bot es miembro del chat, lo mostramos por consola
      console.log(`El bot está en el chat ${chatId}`);
    }
  }).catch((error) => {
    console.error(error);
  });
});

bot.launch();
