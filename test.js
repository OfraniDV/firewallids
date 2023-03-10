require('dotenv').config();

const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

async function getChatMember(ctx, alias) {
  const BASE_URL = `https://api.telegram.org/bot${ctx.token}`;
  try {
    const response = await fetch(`${BASE_URL}/getChatMembersCount?chat_id=${ctx.chat.id}`);
    const data = await response.json();
    if (data.result === 0) {
      ctx.reply(`No se encontró al usuario ${alias} en este chat.`);
      return;
    }
    const response2 = await fetch(`${BASE_URL}/getChatMember?chat_id=${ctx.chat.id}&user_id=${data.result - 1}`);
    const data2 = await response2.json();
    if (!data2.result) {
      ctx.reply(`No se encontró al usuario ${alias} en este chat.`);
      return;
    }
    const userId = data2.result.user.id;
    ctx.reply(`El ID del usuario ${alias} es ${userId}.`);
  } catch (error) {
    console.log(error);
    ctx.reply(`No se encontró al usuario ${alias} en este chat.`);
  }
}

bot.command('getid', (ctx) => {
  const alias = ctx.message.text.split(' ')[1];
  if (!alias) {
    ctx.reply('Debes ingresar un alias después de /getid.');
    return;
  }
  getChatMember(ctx, alias);
});

bot.launch();
