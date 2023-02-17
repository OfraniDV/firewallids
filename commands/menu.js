const { Markup } = require('telegraf');

// Creamos un objeto con las opciones del menú
const menuOptions = Markup.inlineKeyboard([
  [
    Markup.button.callback('Opción 1', 'opcion_1'),
    Markup.button.callback('Opción 2', 'opcion_2'),
  ],
  [
    Markup.button.callback('Opción 3', 'opcion_3'),
    Markup.button.callback('Opción 4', 'opcion_4'),
  ],
]);

// Exportamos el objeto con las opciones del menú
module.exports = { menuOptions };
