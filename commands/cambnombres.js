//Sobre la DB
const { pool } = require('../psql/db');
const { buscarCambiosCronologicosNombres } = require('../psql/dblogic');
const { verificarRepeticionesIDNombres } = require('../psql/dblogic');

// Manejador de comandos para /cambnombres
module.exports = async (ctx) => {
  try {
    const userId = ctx.message.from.id;
    let id = userId;
    let nombreUsuario = ctx.message.from.first_name;
    if (ctx.message.text.split(' ').length > 1) {
      id = ctx.message.text.split(' ')[1];
      if (id.startsWith('@')) {
        const username = id.substring(1);
        const user = await ctx.telegram.getChat(username);
        id = user.id;
      }
      const userInfo = await ctx.telegram.getChat(id);
      nombreUsuario = userInfo.first_name;
    }
    const numCambios = await verificarRepeticionesIDNombres(id);
    let cambios = [];
    if (numCambios > 0) {
      cambios = await buscarCambiosCronologicosNombres(id);
    }
    const message = `📝 El usuario de ID ${id} se llama ${nombreUsuario} y ha tenido ${numCambios} cambios en su nombre:\n\n`;
    const cambiosMessage = cambios.map((cambio) => {
      const date = new Date(cambio.tiempo).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const time = new Date(cambio.tiempo).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return `🗓️ ${date} ${time} - ${cambio.nombres}`;
    }).join('\n');
    const response = message + cambiosMessage + '\n\n¿Puedo ayudarte con algo más? Prueba /ayuda para obtener la lista completa de comandos.';
    ctx.reply(response);
  } catch (err) {
    console.error(err);
    ctx.reply('Lo siento, no pude encontrar información sobre este usuario. Por favor, inténtalo más tarde. ¿Puedo ayudarte con algo más? Prueba /ayuda para obtener la lista completa de comandos.');
  }
};
