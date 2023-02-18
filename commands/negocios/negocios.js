const { Markup } = require('telegraf');

// Creamos un objeto con las opciones del menú de negocios
const negociosOptions = Markup.inlineKeyboard([
  [Markup.button.callback('💰 Comprar', 'comprar'), Markup.button.callback('💵 Vender', 'vender')],
  [Markup.button.callback('🔍 Buscar productos', 'buscar_productos'), Markup.button.callback('👥 Ofertas', 'ofertas')],
  [Markup.button.callback('👀 Valoraciones y reseñas', 'valoraciones'), Markup.button.callback('⬅️ Regresar', 'menu_principal')],
  [Markup.button.callback('❌ Salir', 'salir')],
]);

// Exportamos el objeto con las opciones del menú de negocios
module.exports = { negociosOptions };
