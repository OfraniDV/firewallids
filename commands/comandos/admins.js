const { Markup } = require('telegraf');

const administradoresOptions = Markup.inlineKeyboard([
  [
    Markup.button.callback('🔒 Agr Lista Negra', 'agregar_lista_negra'),
    Markup.button.callback('🔓 Elim Lista Negra', 'eliminar_lista_negra'),
  ],
  [
    Markup.button.callback('➕ Agr+1 Lista Negra', 'agregar_lista_negra_mas'),
    Markup.button.callback('➖ Elim+1 Lista Negra', 'eliminar_lista_negra_mas'),
  ],
  [
    Markup.button.callback('🔇 Silenciar', 'silenciar'),
    Markup.button.callback('🔕 Silenciar Todos', 'silenciar_todos'),
  ],
  [
    Markup.button.callback('🔈 Desilenciar', 'desilenciar'),
    Markup.button.callback('🔊 Desilenciar Todos', 'desilenciar_todos'),
  ],
  [
    Markup.button.callback('🚪 Expulsar', 'expulsar'),
    Markup.button.callback('👞 Expulsar Varios', 'expulsar_varios'),
  ],
  [
    Markup.button.callback('🚫 Ban', 'ban'),
    Markup.button.callback('👞 Ban Varios', 'ban_varios'),
  ],
  [
    Markup.button.callback('✅ Unban', 'unban'),
    Markup.button.callback('👞 Unban Varios', 'unban_varios'),
  ],
  [
    Markup.button.callback('❌ Eliminar Mensaje', 'eliminar_mensaje'),
    Markup.button.callback('📌 Fijar Mensaje', 'fijar_mensaje'),
  ],
  [
    Markup.button.callback('👋 Bienvenida', 'bienvenida'),
    Markup.button.callback('📜 Reglas', 'reglas'),
  ],
  [
    Markup.button.callback('🦠 Desinfectar', 'desinfectar'),
  ],
  [
    Markup.button.callback('👤 Agr Admin', 'agregar_admin'),
    Markup.button.callback('🗑️ Elim Admin', 'eliminar_admin'),
  ],
  [
    Markup.button.callback('📩 Enviar Mensaje', 'enviar_mensaje'),
    Markup.button.callback('📢 Enviar a Todos', 'enviar_mensaje_todos'),
  ],
  [
    Markup.button.callback('⬅️ Regresar', 'menu_anterior'),
    Markup.button.callback('❌ Salir', 'salir'),
  ],
])

module.exports = { administradoresOptions };
