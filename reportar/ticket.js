const { pool } = require('../psql/db');

async function mostrarTicket(ctx) {
    const ticket = ctx.message.text.split(' ')[1];
    if (!ticket) {
      const client = await pool.connect();
      try {
        const res = await client.query('SELECT ticket, user_id, fecha FROM reportes WHERE resolver = false OR resolver IS NULL');
  
        if (res.rowCount === 0) {
          return await ctx.reply(`No tengo tickets pendientes por resolver. ¡Buen trabajo! 👍`);
        }
  
        let mensaje = `📌 *Tickets pendientes* 📌\n\n`;
        let numTickets = 0;
  
        for (let row of res.rows) {
          numTickets++;
          const fechaFormateada = new Date(row.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
          mensaje += `🎫 Ticket #${row.ticket} (${fechaFormateada}) pendiente del usuario ${row.user_id}\n`;
        }
  
        mensaje += `\nEn total existen ${numTickets} tickets pendientes de resolución.`;
        return await ctx.replyWithMarkdown(mensaje);
      } catch (err) {
        console.log(err.stack);
      } finally {
        client.release();
      }
    }
  
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM reportes WHERE ticket = $1', [ticket]);
  
      if (res.rowCount === 0) {
        return await ctx.reply(`Lo siento, no se encontró ningún reporte con el número de ticket ${ticket}.`);
      }
  
      const { user_id, reporte, fecha, resolver, solucion, id_admin_resolvio } = res.rows[0];
  
      let mensaje = `🎫 *Ticket #${ticket}* 🎫\n\n`;
      mensaje += `📆 Fecha del reporte: ${new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}\n\n`;
      mensaje += `👤 Usuario que envió el reporte: ${user_id}\n\n`;
      mensaje += `📩 Mensaje: ${reporte}\n\n`;
  
      if (resolver) {
        mensaje += `👮‍♂️ Resuelto por el administrador con ID: ${id_admin_resolvio}\n\n✅ Solución: ${solucion}`;
      } else {
        mensaje += `❌ Este reporte aún no ha sido resuelto.`;
      }
  
      await ctx.replyWithMarkdown(mensaje);
    } catch (err) {
      console.log(err.stack);
    } finally {
      client.release();
    }
  }
 

module.exports = { mostrarTicket };

