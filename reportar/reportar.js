require('dotenv').config();

const { Telegraf, TelegramError } = require('telegraf');

const { pool } = require('../psql/db');
const { escape } = require('lodash');

//Conexion del BOT Variables de Entorno
const bot = new Telegraf(process.env.BOT_TOKEN, { allow_callback_query: true });

async function reportar(ctx) {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;
  const chatTitle = ctx.chat.title;
  const chatType = ctx.chat.type;
  let reporte = ctx.message.text.split(' ').slice(1).join(' ');

  let mensajeReporte = '';
  let origenMensaje = '';
  if (chatType === 'group' || chatType === 'supergroup') {
    mensajeReporte = `Reporte de usuario: ${ctx.from.first_name} (${userId})\n\nMensaje enviado desde el grupo "${chatTitle}" (${chatId}):\n${reporte}\n\n`;
    origenMensaje = `Este mensaje fue enviado desde el grupo "${chatTitle}" (${chatId}).`;
  } else if (chatType === 'private') {
    mensajeReporte = `Reporte de usuario: ${ctx.from.first_name} (${userId})\n\nMensaje enviado desde el chat privado del bot:\n${reporte}\n\n`;
    origenMensaje = `Este mensaje fue enviado desde un chat privado con el bot.`;
  }

  mensajeReporte += origenMensaje;

  const client = await pool.connect();
  try {
    const res = await client.query('INSERT INTO reportes (ticket, user_id, reporte) VALUES (nextval(\'reportes_ticket_seq\'), $1, $2) RETURNING ticket', [userId, mensajeReporte]);

    const ticket = res.rows[0].ticket;
    console.log(`Nuevo reporte recibido. El número de ticket es: ${ticket}`);
    await ctx.replyWithMarkdown(`¡Tu reporte se ha enviado a los administradores! Tu número de ticket es: \`${ticket}\` 🎫`);

    const mensajeAdmin = `🔔 Nuevo reporte recibido. El número de ticket es: ${ticket}\n📢 *Reporte de usuario* 📢\n👤 Usuario: ${ctx.from.first_name} (${userId})\n\n📩 Mensaje: ${escape(reporte)}\n\n${origenMensaje}`;
    const adminList = [process.env.ID_GROUP_ADMIN];
    for (let admin of adminList) {
      try {
        const sentMessage = await ctx.telegram.sendMessage(admin, mensajeAdmin, { parse_mode: 'Markdown' });
        await ctx.telegram.pinChatMessage(admin, sentMessage.message_id);
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.release();
  }
}

module.exports = { reportar };
