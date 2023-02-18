const { Markup } = require('telegraf');

// Creamos un objeto con las opciones del submenú "Comandos para usuarios"
const comandosUsuariosOptions = Markup.inlineKeyboard([
  [
    Markup.button.callback('📖 Ayuda', 'ayuda'),
    Markup.button.callback('💬 Reputación', 'reputacion'),
    Markup.button.callback('📝 Cambios', 'cambios'),
  ],
  [
    Markup.button.callback('🔍 Buscar', 'buscar'),
    Markup.button.callback('❓ RepuInfo', 'repuinfo'),
  ],
  [
    Markup.button.callback('👍 RepuPositiva', 'repupositiva'),
    Markup.button.callback('👎 RepuNegativa', 'repunegativa'),
  ],
  [
    Markup.button.callback('📄 KYC', 'kyc'),
    Markup.button.callback('📄 TYC', 'tyc'),
  ],
  [
    Markup.button.callback('⬅️ Regresar', 'menu_anterior'),
    Markup.button.callback('❌ Salir', 'salir'),
  ],
]);

// Exportamos el objeto con las opciones del submenú "Comandos para usuarios"
module.exports = { comandosUsuariosOptions };
