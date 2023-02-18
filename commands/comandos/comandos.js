const { Markup } = require('telegraf');

// Creamos un objeto con las opciones del submenú "Comandos"
const comandosOptions = Markup.inlineKeyboard([
  [
    Markup.button.callback('👤 Para Usuarios', 'comandos_usuarios'),
    Markup.button.callback('👑 Para Administradores', 'comandos_administradores'),
  ],
  [Markup.button.callback('⬅️ Regresar', 'menu_principal'), Markup.button.callback('❌ Salir', 'salir')],
]);

// Exportamos el objeto con las opciones del submenú "Comandos"
module.exports = { comandosOptions };
