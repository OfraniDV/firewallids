//Sobre la DB
const { pool } = require('../psql/db');
const { buscarCambiosCronologicosUsuarios } = require('../psql/dblogic');
const { verificarRepeticionesIDUsuarios } = require('../psql/dblogic');

// Manejador de comandos para /cambusuarios
module.exports = async (ctx) => {
  const userId = ctx.message.from.id;
  let id = userId;
  let nombreUsuario = ctx.message.from.first_name;
  if (ctx.message.text.split(' ').length > 1) {
    id = ctx.message.text.split(' ')[1];
    if (id.startsWith('@')) {
      const username = id.substring(1);
      try {
        const user = await ctx.telegram.getChat(username);
        id = user.id;
        nombreUsuario = user.first_name;
      } catch (error) {
        console.error(error);
        ctx.reply('Lo siento, no se ha encontrado información para este usuario. Por favor, intente nuevamente usando un ID de usuario en lugar de un nombre de usuario (alias). ¿Puedo ayudar con algo más? Puede escribir /ayuda para ver una lista de comandos disponibles.');
        return;
      }
    } else {
      try {
        const userInfo = await ctx.telegram.getChat(id);
        nombreUsuario = userInfo.first_name;
      } catch (error) {
        console.error(error);
        ctx.reply('Lo siento, no se ha encontrado información para este usuario. ¿Puedo ayudar con algo más? Puede escribir /ayuda para ver una lista de comandos disponibles.');
        return;
      }
    }
  }
  const numCambios = await verificarRepeticionesIDUsuarios(id);
  let cambios = [];
  if (numCambios > 0) {
    cambios = await buscarCambiosCronologicosUsuarios(id);
  }
  const message = `📝 El usuario de ID ${id} se llama ${nombreUsuario} y ha tenido ${numCambios} cambios en su @alias:\n\n`;
  const cambiosMessage = cambios.map((cambio) => {
    const date = new Date(cambio.tiempo).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const time = new Date(cambio.tiempo).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `🗓️ ${date} ${time} - ${cambio.usuario}`;
  }).join('\n');
  const response = message + cambiosMessage + '\n\n¿Puedo ayudar con algo más? Puede escribir /ayuda para ver una lista de comandos disponibles.';
  ctx.reply(response);
};
