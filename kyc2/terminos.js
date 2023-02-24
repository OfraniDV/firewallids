const { Markup } = require('telegraf');

function mostrarTerminos(ctx) {
  const terminos = `Estos son los términos y condiciones del uso del Bot Firewallids:

1. Firewallids se reserva el derecho de negar el servicio a cualquier persona por cualquier motivo en cualquier momento.

2. Usted entiende que su contenido (sin incluir su información de tarjeta de crédito), puede ser transferido sin cifrar e involucrar (a) transmisiones a través de varias redes; y (b) cambios para ajustarse y adaptarse a los requisitos técnicos de conexión de redes o dispositivos. La información de la tarjeta de crédito está siempre cifrada durante la transferencia a través de las redes.

3. Usted acepta no reproducir, duplicar, copiar, vender, revender o explotar ninguna parte del servicio, uso del servicio o acceso al servicio o cualquier contacto en el sitio web a través del cual se presta el servicio, sin el expreso permiso por escrito de Firewallids.

4. Los títulos utilizados en este acuerdo se incluyen solo por conveniencia y no limitarán ni afectarán estos Términos.

Al hacer clic en "✅ Acepto", acepta estos términos y condiciones.`;

  ctx.reply('Para continuar, debe aceptar los términos y condiciones:', Markup.inlineKeyboard([
    [
      {
        text: '✅ Acepto',
        callback_data: 'aceptar'
      },
      {
        text: '❌ No Acepto',
        callback_data: 'noaceptar'
      }
    ]
  ])).then(() => {
    ctx.reply(terminos);
  });
}

module.exports = {
  mostrarTerminos
};
