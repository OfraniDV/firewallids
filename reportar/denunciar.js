require('dotenv').config();
const { Telegraf } = require('telegraf');
const { pool } = require('../psql/db');
const bot = new Telegraf(process.env.BOT_TOKEN);

async function denunciar(ctx) {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;
  const chatTitle = ctx.chat.title;
  const chatType = ctx.chat.type;
  let reporte = ctx.message.text.split(' ').slice(1).join(' ');

  // Define el mensaje del reporte sin la información de chat privado o grupo
  let mensajeReporte = reporte;

  // Define el origen del mensaje (chat privado o grupo)
  let origenMensaje = '';
  let groupInviteLink = '';
  if (chatType === 'group' || chatType === 'supergroup') {
    origenMensaje = `Este mensaje fue enviado desde el grupo ${chatTitle}.`;

    // Obtener enlace de invitación del chat que nunca expira
    const chatInviteLink = await ctx.telegram.exportChatInviteLink(chatId);

    // Obtener ID del mensaje actual o del mensaje que se está respondiendo
    const messageId = ctx.message.reply_to_message ? ctx.message.reply_to_message.message_id : ctx.message.message_id;

    // Concatenar el enlace de invitación del chat y el ID del mensaje para crear un enlace directo al mensaje
    groupInviteLink = `Enlace al grupo: ${chatInviteLink}\nEnlace al mensaje: https://t.me/c/${chatId.toString().slice(4)}/${messageId}`;
  } else if (chatType === 'private') {
    origenMensaje = `Este mensaje fue enviado desde un chat privado con el bot.`;
  }

  // Define el mensaje completo (reporte + origen del mensaje)
  let mensajeCompleto = `${mensajeReporte}\n\n${origenMensaje}\n\n${groupInviteLink}`;

  const client = await pool.connect();
  try {
    const res = await client.query('INSERT INTO reportes (ticket, user_id, reporte, mensaje_link) VALUES (nextval(\'reportes_ticket_seq\'), $1, $2, $3) RETURNING ticket', [userId, mensajeReporte, mensajeCompleto]);

    const ticket = res.rows[0].ticket;
    console.log(`Nuevo reporte recibido. El número de ticket es: ${ticket}`);
    await ctx.reply(`¡Tu reporte se ha enviado a los administradores! Tu número de ticket es: \`${ticket}\` 🎫`);

    const mensajeAdmin = `🔔 Nuevo reporte recibido. El número de ticket es: ${ticket}\n📢 *Reporte de usuario* 📢\n👤 Usuario: ${ctx.from ? ctx.from.first_name : 'Nombre de usuario no disponible'} (${userId})\n\n📩 Mensaje: ${mensajeCompleto}`;
    const adminList = [process.env.ID_GROUP_ADMIN];
    for (let admin of adminList) {
      try {
        const sentMessage = await ctx.telegram.sendMessage(admin, mensajeAdmin);
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

module.exports = { denunciar };


