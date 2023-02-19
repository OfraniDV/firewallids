// Sobre la DB
const { buscarCambiosCronologicosNombres, verificarRepeticionesIDNombres } = require('../psql/dblogic');
const { pool } = require('../psql/db');

// Manejador de comandos para /cambnombres
module.exports = async (ctx) => {
  const userId = ctx.message.from.id;
  let id = userId;
  let nombreUsuario = ctx.message.from.first_name;
  if (ctx.message.text.split(' ').length > 1) {
    id = ctx.message.text.split(' ')[1];
    if (id.startsWith('@')) {
      try {
        const user = await ctx.telegram.getChat(id.substring(1));
        id = user.id;
        nombreUsuario = user.first_name;
      } catch (error) {
        ctx.reply(`No pude encontrar al usuario con alias @${id.substring(1)}. Por favor intenta con un ID de usuario.`);
        ctx.reply('¿Necesitas ayuda? Usa el comando /ayuda');
        return;
      }
    } else {
      const userInfo = await ctx.telegram.getChat(id);
      nombreUsuario = userInfo.first_name;
    }
  }

  const numCambios = await verificarRepeticionesIDNombres(id);
  let cambios = [];
  if (numCambios > 0) {
    cambios = await buscarCambiosCronologicosNombres(id);
  }
  const message = `📝 El usuario de ID ${id} se llama ${nombreUsuario} y ha tenido ${numCambios} cambios en su nombre:\n\n`;
  const cambiosMessage = cambios
    .map((cambio) => {
      const date = new Date(cambio.tiempo).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const time = new Date(cambio.tiempo).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return `🗓️ ${date} ${time} - ${cambio.nombres}`;
    })
    .join('\n');
  const response = message + cambiosMessage;
  ctx.reply(response);
};
