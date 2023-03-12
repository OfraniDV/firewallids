const { md, escapeMarkdown } = require('telegram-escape');
const { pool } = require('../psql/db');
const { findIdByAlias } = require('../commands/alias');

async function mostrarTicket(ctx) {
  const ticket = ctx.message.text.split(' ')[1];
  if (!ticket) {
    // código omitido
  }
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM reportes WHERE ticket = $1', [ticket]);
    if (res.rowCount === 0) {
      return await ctx.reply(`Lo siento, no se encontró ningún reporte con el número de ticket ${ticket}.`);
    }
    const { user_id, reporte, fecha, resolver, solucion, id_admin_resolvio } = res.rows[0];

    let userName = await findIdByAlias(user_id);
    if (!userName) {
      // En caso de no encontrar el alias, se muestra el ID
      userName = user_id;
    }

    let mensaje = `🎫 *Ticket #${ticket}* 🎫\n\n`;
    mensaje += `📆 Fecha del reporte: ${new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}\n\n`;
    mensaje += `👤 Usuario que envió el reporte: ${userName}\n\n`;
    mensaje += `📩 Mensaje: ${escapeMarkdown(reporte)}\n\n`;
    if (resolver) {
      mensaje += `👮‍♂️ Resuelto por el administrador con ID: ${id_admin_resolvio}\n\n✅ Solución: ${escapeMarkdown(solucion)}`;
    } else {
      mensaje += `❌ Este reporte aún no ha sido resuelto.`;
    }
    return await ctx.replyWithMarkdown(mensaje);
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.release();
  }
}
module.exports = { mostrarTicket };
