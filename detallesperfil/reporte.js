const { checkIdentidad } = require('./identidades');
const { checkFirewallids } = require('./kycfirewallids');
const { checkAdministrador } = require('./listanegra_administradores');
const { checkListanegra } = require('./listanegra');
const { checkGruposComunes } = require('./monitorizacion_usuarios_grupos');

const emojiencabezado = '📩';
const emojiCheck = '✅';
const emojiWarning = '😎';
const emojitriste = '🤯';
const emojiPeligro = '🚷';
const emojiGroup = '👥';
const signature = '\nEste es un resumen actualizado para este ID.\nGracias por usar nuestros servicios:\nReputación Plus y Firewallids.';

async function perfil(ctx) {
  let userID;
  // Si se está respondiendo a un mensaje, usar el ID del mensaje
  if (ctx.message.reply_to_message) {
    userID = ctx.message.reply_to_message.from.id;
  }
  // Si el usuario proporciona un ID, usar ese ID
  if (ctx.message.text.split(' ')[1]) {
    userID = ctx.message.text.split(' ')[1];
  }
  // Si no se ha proporcionado un ID válido, usar el ID del usuario que envía el mensaje
  if (!userID || isNaN(parseInt(userID))) {
    userID = ctx.from.id;
  }
  // Obtener información de identidad del usuario
  const identidad = await checkIdentidad(userID);
  // Obtener información de KYC Firewallids del usuario
  const firewallids = await checkFirewallids(userID);
  // Obtener información de listas negras del usuario
  const listasNegras = await checkListanegra(userID);
  // Obtener información de administradores del sistema
  const administrador = await checkAdministrador(userID);
  // Obtener información de grupos comunes con el usuario
  const gruposComunes = await checkGruposComunes(userID);
  // Crear mensaje de respuesta
  let mensaje = `===============================\nEsto es lo que conozco sobre el Perfil de ID: ${userID}\nHasta la fecha de hoy ${new Date().toLocaleDateString()} ${emojiencabezado}\n===============================\n\n`;
  if (listasNegras) {
    mensaje += `${emojiPeligro} ¡CUIDADO! Este usuario se encuentra en Lista Negra por el siguiente motivo: ${listasNegras}\n`;
  }
  if (identidad) {
    mensaje += `${emojiCheck} Este usuario se encuentra Verificado en el Bot Reputación Plus, ha realizado su KYC correctamente.\n`;
  }
  if (firewallids) {
    mensaje += `${emojiCheck} Este usuario está verificado en el bot Firewallids.\n`;
  }
  if (administrador) {
    mensaje += `${emojiWarning} Este usuario es un Administrador del Sistema Reputación Plus y Firewallids.\n`;
  }
  if (gruposComunes) {
    mensaje += `${emojiGroup} ${gruposComunes}\n`;
  }
  // Si no se encontró información del usuario en ninguna búsqueda anterior
  if (!listasNegras && !identidad && !firewallids && !administrador && !gruposComunes) {
    mensaje += `${emojitriste} No he tenido la oportunidad de ver este usuario anteriormente. Por favor, si puedes agregar este usuario o reenviarnos un mensaje a un grupo donde se encuentre el bot Reputación Plus y Firewallids y vuelve a usar este comando.\n`;
  }
  mensaje += signature;
  // Enviar mensaje de respuesta
  ctx.reply(mensaje);
}

module.exports = { perfil };
