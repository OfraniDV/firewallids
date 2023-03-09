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

  // Define el mensaje del reporte sin la información de chat privado o grupo
  let mensajeReporte = reporte;

  // Define el origen del mensaje (chat privado o grupo)
  let origenMensaje = '';
  if (chatType === 'group' || chatType === 'supergroup') {
    origenMensaje = `Este mensaje fue enviado desde el grupo "${chatTitle}" (${chatId}).`;
  } else if (chatType === 'private') {
    origenMensaje = `Este mensaje fue enviado desde un chat privado con el bot.`;
  }

  // Define el mensaje completo (reporte + origen del mensaje)
  let mensajeCompleto = `${mensajeReporte}\n\n${origenMensaje}`;

  const messageLink = `https://t.me/c/${ctx.message.chat.id.toString().substring(4)}/${ctx.message.message_id}`;

  const client = await pool.connect();
  try {
    const res = await client.query('INSERT INTO reportes (ticket, user_id, reporte, mensaje_link) VALUES (nextval(\'reportes_ticket_seq\'), $1, $2, $3) RETURNING ticket', [userId, mensajeReporte, messageLink]);

    const ticket = res.rows[0].ticket;
    console.log(`Nuevo reporte recibido. El número de ticket es: ${ticket}`);
    await ctx.replyWithMarkdown(`¡Tu reporte se ha enviado a los administradores! Tu número de ticket es: \`${ticket}\` 🎫`);

    const mensajeAdmin = `🔔 Nuevo reporte recibido. El número de ticket es: ${ticket}\n📢 *Reporte de usuario* 📢\n👤 Usuario: ${ctx.from.first_name} (${userId})\n\n📩 Mensaje: ${escape(mensajeCompleto)}\n\n🔗 Enlace al mensaje: ${messageLink}`;
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

