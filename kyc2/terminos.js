const { pool } = require('../psql/db');

const terminos = `
TÉRMINOS Y CONDICIONES DE USO DEL BOT FIREWALLIDS

Por favor lea estos Términos y Condiciones de uso ("Términos", "Términos y Condiciones") detenidamente antes de utilizar el Bot Firewallids operado por Firewallids ("nosotros", "nos", o "nuestro").

Su acceso y uso del Bot está condicionado a su aceptación y cumplimiento de estos Términos. Estos Términos se aplican a todos los visitantes, usuarios y otras personas que acceden o utilizan el Bot.

Al acceder o utilizar el Bot, usted acepta estar obligado por estos Términos. Si no está de acuerdo con alguna parte de los términos, entonces no podrá acceder al Bot.

Información personal
Al utilizar el Bot, usted acepta la recopilación y uso de información de acuerdo con nuestra Política de Privacidad.

Comunicaciones
Al utilizar el Bot, usted acepta recibir comunicaciones de nuestra parte. Si desea darse de baja de nuestras comunicaciones, por favor contáctenos.

Cambios
Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es importante, intentaremos proporcionar un aviso de al menos 30 días antes de que entren en vigencia los nuevos términos. Lo que constituye un cambio importante se determinará a nuestra sola discreción.

Al continuar accediendo o utilizando nuestro Bot después de que esas revisiones entren en vigencia, usted acepta estar sujeto a los términos revisados.

Contacto
Si tiene alguna pregunta sobre estos Términos, por favor contáctenos.
`;

async function mostrarTerminos(ctx) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Acepto 🙋‍♀️',
            callback_data: 'aceptoTerminos'
          },
          {
            text: 'No Acepto 🙅‍♂️',
            callback_data: 'noAceptoTerminos'
          }
        ]
      ]
    }
  };

  ctx.reply(terminos, options);
}

async function aceptoTerminos(ctx) {
  const user_id = BigInt(ctx.from.id);

  try {
    await pool.query('UPDATE kycfirewallids SET terms_accepted = true WHERE user_id = $1', [user_id]);
    await ctx.reply('Gracias por aceptar los términos y condiciones del bot Firewallids!');
  } catch (err) {
    console.error('Error actualizando términos en la tabla:', err.message);
    await ctx.reply('Ha ocurrido un error al actualizar los términos y condiciones. Por favor, inténtelo de nuevo más tarde.');
  }
}

module.exports = {
  terminos,
  mostrarTerminos,
  aceptoTerminos
};
