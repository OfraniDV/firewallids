// Sobre la DB
const { buscarCambiosCronologicosUsuarios } = require('../../psql/dblogic');
const { pool } = require('../../psql/db');

// Manejador de comandos para /alias
module.exports = async (ctx) => {
  let id, nombreUsuario;

  if (ctx.message.reply_to_message) {
    id = ctx.message.reply_to_message.from.id;
    nombreUsuario = ctx.message.reply_to_message.from.first_name;
  } else {
    id = ctx.message.from.id;
    nombreUsuario = ctx.message.from.first_name;
  }

  if (ctx.message.text.split(' ').length > 1) {
    id = ctx.message.text.split(' ')[1];
    if (id.startsWith('@')) {
      try {
        const user = await ctx.telegram.getChat(id.substring(1));
        id = user.id;
        nombreUsuario = user.first_name;
      } catch (error) {
        ctx.reply(`🚫 No pude encontrar al usuario con alias @${id.substring(1)}. Por favor intenta con un ID de usuario.`);
        return;
      }
    } else {
      const userInfo = await ctx.telegram.getChat(id);
      nombreUsuario = userInfo.first_name;
    }
  }

  const cambios = await buscarCambiosCronologicosUsuarios(id);

  const message = cambios.length > 0 ? `📝 El usuario de ID ${id} se llama ${nombreUsuario} y ha tenido ${cambios.length} cambios en su alias:\n\n` : `📝 No se encontraron cambios en el alias para el usuario de ID ${id}.`;
  const cambiosMessage = cambios.map((cambio) => {
    const date = new Date(cambio.tiempo).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const time = new Date(cambio.tiempo).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `🗓️ ${date} ${time} - ${cambio.usuario}`;
  }).join('\n');
  const response = message + cambiosMessage;

  const emojis = ['🎭', '🤹‍♂️', '🎬', '🎤', '🎧', '🎹'];
  const emojiIndex = Math.floor(Math.random() * emojis.length);
  const totalMessage = cambios.length > 0 ? `👉 En total ${nombreUsuario} ha tenido ${cambios.length} cambios en su alias ${emojis[emojiIndex]}` : `👉 No he interactuado aún con este usuario. 😕`;
  ctx.reply(response + '\n\n' + totalMessage);
};
