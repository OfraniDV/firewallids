//Sobre la DB
const { pool } = require('../../psql/db');
const { buscarCambiosCronologicosUsuarios, verificarRepeticionesIDUsuarios } = require('../../psql/dblogic');

// Manejador de comandos para /cambusuarios
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
    const input = ctx.message.text.split(' ')[1];
    if (input.startsWith('@')) {
      ctx.reply(`🚫 Acceso denegado. Solo puedo buscar cambios para IDs de usuario. Por favor, proporcione un ID en su lugar.`);
      return;
    } else if (!isNaN(input)) {
      id = input;
      const userInfo = await ctx.telegram.getChat(id);
      nombreUsuario = userInfo.first_name;
    } else {
      ctx.reply(`🚫 Acceso denegado. Solo puedo buscar cambios para IDs de usuario. Por favor, proporcione un ID en su lugar.`);
      return;
    }
  }

  const cambios = await buscarCambiosCronologicosUsuarios(id);
  const uniqueDays = new Set(cambios.map((cambio) => new Date(cambio.tiempo).toLocaleDateString()));
  const uniqueChanges = Array.from(uniqueDays).map((uniqueDay) => {
    const changesOnDay = cambios.filter((cambio) => new Date(cambio.tiempo).toLocaleDateString() === uniqueDay);
    const uniqueTimes = new Set(changesOnDay.map((change) => new Date(change.tiempo).toLocaleTimeString()));
    const uniqueChangesOnDay = Array.from(uniqueTimes).map((uniqueTime) => {
      return changesOnDay.find((change) => new Date(change.tiempo).toLocaleTimeString() === uniqueTime);
    });
    return uniqueChangesOnDay;
  }).flat();

  const numCambios = uniqueChanges.length;
  const message = numCambios > 0 ? `📝 El usuario de ID ${id} se llama ${nombreUsuario} y ha tenido ${numCambios} cambios en su alias:\n\n` : `📝 No se encontraron cambios en el alias para el usuario de ID ${id}.\n\n`;
  const cambiosMessage = uniqueChanges.map((cambio) => {
    const date = new Date(cambio.tiempo).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const time = new Date(cambio.tiempo).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `🗓️ ${date} ${time} - ${cambio.usuario}`;
  }).join('\n');
  const response = message + cambiosMessage;

  if (numCambios === 1) {
    ctx.reply(response);
  } else {
    const emojis = ['🎭', '🤹‍♂️', '🎬', '🎤', '🎧', '🎹'];
  const emojiIndex = Math.floor(Math.random() * emojis.length);
  const totalMessage = numCambios > 0 ? `👉 En total ${nombreUsuario} ha tenido ${numCambios} cambios en su alias ${emojis[emojiIndex]}` : `👉 No he interactuado aún con este usuario. 😕`;
  ctx.reply(response + '\n\n' + totalMessage);
}
};