// Importa la variable Pool desde el archivo ../psql/db.js
const { pool } = require('../psql/db');

// Función que limpia los grupos
async function cleanGroups(ctx) {
  console.log('Iniciando limpieza de grupos');

  // Enviar mensaje de que se iniciará la limpieza a todos los grupos donde esté el bot
  const groups = await ctx.telegram.getMyCommands();
  for (let group of groups) {
    if (group.type === 'group') {
      ctx.telegram.sendMessage(
        group.chat.id,
        `🧹 **¡Atención!** Se realizará una limpieza en este grupo en breve. Se expulsará a los usuarios en la lista negra. 🚫`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  // Consultamos los usuarios en la lista negra
  const blacklist = await pool.query('SELECT id, motivos FROM listanegra');

  let totalExpulsados = 0;
  let totalGruposAnalizados = 0;

  // Iteramos sobre cada grupo
  for (let group of groups) {
    // Verificamos si el bot se encuentra en el grupo actual
    const botInGroup = await ctx.telegram.getChatMember(group.chat.id, ctx.botInfo.id);
    if (botInGroup.status !== 'member') continue;

    totalGruposAnalizados++;

    // Consultamos los miembros del grupo actual
    const members = await ctx.telegram.getChatMembers(group.chat.id);

    // Iteramos sobre cada miembro del grupo
    for (let member of members) {
      // Verificamos si el id del miembro actual se encuentra en la lista negra
      const blacklistedUser = blacklist.rows.find((user) => user.id === member.user.id);
      if (blacklistedUser) {
        // Expulsamos al usuario del grupo
        await ctx.telegram.kickChatMember(group.chat.id, member.user.id);

        const motivo = blacklistedUser.motivos.find((motivo) => motivo.id === member.user.id)?.motivo || 'Sin motivo especificado';

        // Enviamos un mensaje al usuario explicando el motivo de la expulsión
        await ctx.telegram.sendMessage(
          member.user.id,
          `🚫 **¡Atención!** Has sido expulsado del grupo *${group.title}* debido a que te encuentras en la lista negra. Motivo: ${motivo}`,
          { parse_mode: 'Markdown' }
        );

        totalExpulsados++;
      }
    }
  }

  // Enviar reporte al final de la limpieza
  let reporte = `🧹 La limpieza ha finalizado. Se expulsaron un total de *${totalExpulsados}* usuarios de los ${totalGruposAnalizados} grupos donde el bot se encuentra.`;

  console.log(reporte);

  // Enviamos el reporte al chat del usuario que ejecutó el comando
  ctx.telegram.sendMessage(ctx.from.id, reporte, { parse_mode: 'Markdown' });
}

module.exports = { cleanGroups };
