const { pool } = require('../psql/db');
const { Markup } = require('telegraf');
const scene = require('telegraf/scenes/base');

const kycScene = new scene('kyc');

kycScene.enter(async (ctx) => {
  await ctx.reply('Por favor, envía una foto de tu documento de identidad frontal:');
  ctx.session.kyc = {};
});

kycScene.on('photo', async (ctx) => {
  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
  const column = 'id_card_front';
  const query = `
    UPDATE kycfirewallids 
    SET ${column} = $1
    WHERE user_id = $2
  `;
  await pool.query(query, [fileId, ctx.from.id]);

  if (!ctx.session.kyc.id_card_back) {
    await ctx.reply('¡Gracias! Ahora envía una foto de tu documento de identidad reverso:');
    ctx.session.kyc.id_card_front = fileId;
  } else if (!ctx.session.kyc.selfie_photo) {
    await ctx.reply('¡Gracias! Ahora envía una selfie con un papel en blanco con la fecha actual, tu firma, el nombre del bot y tu documento todo bien encuadrado:');
    ctx.session.kyc.id_card_back = fileId;
  } else if (!ctx.session.kyc.deposit_photo) {
    await ctx.reply('¡Gracias! Ahora envía una foto de tu comprobante de transferencia en el banco:');
    ctx.session.kyc.selfie_photo = fileId;
  } else {
    await ctx.reply('¡Gracias por enviar todas las fotos requeridas! La verificación de KYC ha sido completada.');
    ctx.session.kyc.deposit_photo = fileId;
    delete ctx.session.kyc;
    ctx.scene.leave();
  }
});

kycScene.on('message', async (ctx) => {
  await ctx.reply('Por favor, envía una foto.');
});

module.exports = kycScene;
