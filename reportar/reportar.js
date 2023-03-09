require('dotenv').config();

const { Telegraf, TelegramError } = require('telegraf');

const { pool } = require('../psql/db');
const { escape } = require('lodash');

//Conexion del BOT Variables de Entorno
const bot = new Telegraf(process.env.BOT_TOKEN, { allow_callback_query: true });

async function reportar(ctx) {
  const userId = ctx.from.id;
  const mensajeReporte = `Reporte de usuario: ${ctx.from.first_name} (${userId})\n\nMensaje: ${ctx.message.text.split(' ').slice(1).join(' ')}`;
  const client = await pool.connect();
  try {
    const res = await client.query('INSERT INTO reportes (ticket, user_id, reporte) VALUES (nextval(\'reportes_ticket_seq\'), $1, $2) RETURNING ticket', [userId, mensajeReporte]);

    const ticket = res.rows[0].ticket;
    console.log(`Nuevo reporte recibido. El número de ticket es: ${ticket}`);
    await ctx.replyWithMarkdown(`¡Tu reporte se ha enviado a los administradores! Tu número de ticket es: \`${ticket}\` 🎫`);
    const mensajeAdmin = `🔔 Nuevo reporte recibido. El número de ticket es: ${ticket}\n\n📢 *Reporte de usuario* 📢\n\n👤 Usuario: ${ctx.from.first_name} (${userId})\n\n📩 Mensaje: ${escape(mensajeReporte)}\n\n`;
    const adminList = [process.env.ID_GROUP_ADMIN];
    for (let admin of adminList) {
      try {
        await ctx.telegram.sendMessage(admin, mensajeAdmin, { parse_mode: 'Markdown' });
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


async function resolver(ctx) {
  const ticket = parseInt(ctx.state.command.args);
  if (isNaN(ticket)) {
    await ctx.replyWithMarkdown('Debes proporcionar el número de ticket que deseas resolver. Ejemplo: `/ticket 123`');
    return;
  }
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM reportes WHERE ticket = $1', [ticket]);
    if (result.rows.length === 0) {
      await ctx.replyWithMarkdown('El número de ticket que proporcionaste no existe en nuestra base de datos. Verifica el número e intenta nuevamente.');
      return;
    }
    const reporte = result.rows[0];
    if (reporte.resolver) {
      await ctx.replyWithMarkdown('Este reporte ya ha sido resuelto anteriormente. Si necesitas hacer alguna modificación, por favor comunícate con los administradores.');
      return;
    }
    await ctx.replyWithMarkdown(`Resolviendo reporte número \`${ticket}\`\n\nMensaje del usuario: \`${escape(reporte.reporte)}\`\n\nPor favor proporciona la solución para este reporte usando el comando /solucion <ticket> <solución>`);
  } finally {
    client.release();
  }
}

async function solucion(ctx) {
  const ticket = parseInt(ctx.message.text.split(' ')[1]);
  if (!ticket) {
    return ctx.reply('⚠️ Debe proporcionar el número de ticket para resolverlo.');
  }

  const solucion = ctx.message.text.split(' ').slice(2).join(' ');

  const client = await pool.connect();
  try {
    // Actualizar ticket en la base de datos
    const { rows } = await client.query('UPDATE reportes SET resolver = $1, id_admin_resolvio = $2, solucion = $3 WHERE ticket = $4 RETURNING user_id, reporte', [true, ctx.from.id, solucion, ticket]);
    const reporte = rows[0].reporte;
    const userId = rows[0].user_id;

    // Notificar a usuario
    const mensajeUsuario = `Tu reporte ha sido resuelto. Ticket: ${ticket}\n\n${solucion}`;
    await ctx.telegram.sendMessage(userId, mensajeUsuario);

    // Notificar a administradores
    const mensajeAdmins = `🔔 Reporte #${ticket} resuelto\n\nReporte: ${reporte}\n\nSolución: ${solucion}`;
    const admins = await getAdmins();
    admins.forEach(async (admin) => {
      await ctx.telegram.sendMessage(admin.id, mensajeAdmins, { parse_mode: 'Markdown' });
    });

    return ctx.reply('✅ Ticket resuelto exitosamente.');
  } catch (err) {
    console.error(err);
    return ctx.reply('❌ Ocurrió un error al intentar resolver el ticket.');
  } finally {
    client.release();
  }
}


module.exports = { reportar, solucion, resolver };
