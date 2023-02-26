const { pool } = require('../psql/db');
const { Extra, Markup } = require('telegraf');
require('dotenv').config();

const enviarRevisiones = async (ctx) => {
  const userId = ctx.from.id;

  // Verificar si todos los campos están completos
  const kycData = await pool.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [userId]);
  const data = kycData.rows[0];
  if (!data.name || !data.identity_number || !data.phone_number || !data.email || !data.address || !data.municipality || !data.province || !data.id_card_front || !data.id_card_back || !data.selfie_photo || !data.deposit_photo || !data.facebook) {
    await ctx.reply('Por favor complete todos los campos antes de enviar a revisión.');
    return;
  }

  // Crear mensaje con los datos del usuario
  let messageText = `Nuevos datos para KYC.\n\nNombre completo: ${data.name}\nNúmero de identidad: ${data.identity_number}\nNúmero de teléfono: ${data.phone_number}\nCorreo electrónico: ${data.email}\nDirección: ${data.address}\nMunicipio: ${data.municipality}\nProvincia: ${data.province}\nFoto de identificación (frente): ${data.id_card_front}\nFoto de identificación (atrás): ${data.id_card_back}\nSelfie: ${data.selfie_photo}\nComprobante de pago: ${data.deposit_photo}\nFacebook: ${data.facebook}`;

  // Enviar mensaje al grupo de revisión
  const chatId = process.env.ID_GROUP_VERIFY_KYC;
  await ctx.telegram.sendMessage(chatId, messageText, Extra.HTML().markup((markup) => {
    return markup.inlineKeyboard([
      markup.callbackButton('Aceptar KYC', `approveKYC-${userId}`),
      markup.callbackButton('Rechazar KYC', `rejectKYC-${userId}`)
    ]);
  }));

  // Actualizar estado de KYC a "pendiente de revisión"
  await pool.query('UPDATE kycfirewallids SET status = $1 WHERE user_id = $2', ['pendiente de revisión', userId]);

  // Enviar mensaje de éxito al usuario
  await ctx.reply('Sus datos han sido enviados a revisión. Gracias por utilizar nuestro servicio.');
};

module.exports = enviarRevisiones;
