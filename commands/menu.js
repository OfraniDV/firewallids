const { Markup } = require('telegraf');
const { comandosOptions } = require('../commands/comandos/comandos');

// Importamos bot desde app.js por si se necesita
const bot = require('../app');

// Creamos un objeto con las opciones del menú
const menuOptions = Markup.inlineKeyboard([
  [
    Markup.button.callback('📝 Comandos', 'comandos'),
    Markup.button.callback('🔍 Hacer KYC', 'kyc'),
  ],
  [
    Markup.button.callback('🌐 Nuestra Web', 'web'),
    Markup.button.callback('🚨 Denunciar', 'denunciar'),
  ],
  [
    Markup.button.callback('📣 Reclamaciones', 'reclamaciones'),
    Markup.button.callback('🛡️ Soporte Técnico', 'soporte'),
  ],
  [
    Markup.button.callback('📢 Canal de Denuncias', 'canal'),
    Markup.button.callback('👥 Grupos', 'grupos'),
  ],
  [
    Markup.button.callback('ℹ️ Sobre Nosotros', 'nosotros'),
    Markup.button.callback('📜 Reglas', 'reglas'),
  ],
  [
    Markup.button.callback('💰 Donaciones', 'donaciones'),
    Markup.button.callback('💼 Negocios', 'negocios'),
  ],
  [
    Markup.button.callback('🚪 Salir', 'salir'),
  ],
  // Array vacío para crear salto de línea
  [],
]);

// Exportamos el objeto con las opciones del menú
module.exports = { menuOptions };
