require('dotenv').config();

const { Telegraf } = require('telegraf');
const { pool } = require('../psql/db');
const { escape } = require('lodash');

const bot = new Telegraf(process.env.BOT_TOKEN);

async function resolverTicket(ctx) {
  const args = ctx.message.text.split(' ');
  const ticket = args[1];
  const solucion = args.slice(2).join(' ');
  const adminId = ctx.from.id;

  if (!ticket || !solucion) {
    return await ctx.reply('Debes proporcionar el número de ticket y una solución. Ejemplo: /resolverticket 1 La solución del problema.');
  }

  const client = await pool.connect();
  try {
    const res = await client.query('UPDATE reportes SET resolver = true, solucion = $1, id_admin_resolvio = $2 WHERE ticket = $3 RETURNING user_id, reporte', [solucion, adminId, ticket]);

    if (res.rowCount === 0) {
      return await ctx.reply(`Lo siento, no se encontró ningún reporte con el número de ticket ${ticket}.`);
    }

    const { user_id, reporte } = res.rows[0];

    const mensajeUsuario = `🎫 *Ticket resuelto* 🎫\n\nTu ticket con número ${ticket} ha sido resuelto:\n\n📩 Mensaje enviado: ${reporte}\n\n✅ Solución: ${solucion}\n\nSi tienes alguna otra duda, no dudes en contactarnos nuevamente.\n\nBot Reputación Plus y Firewallids`;

    await ctx.telegram.sendMessage(user_id, mensajeUsuario, { parse_mode: 'Markdown' });
    await ctx.reply(`El ticket #${ticket} ha sido resuelto con éxito.`);
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.release();
  }
}

module.exports = { resolverTicket };
