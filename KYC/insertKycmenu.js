const { Markup } = require('telegraf');

const insertName = require('./insertName');
const insertIdentityNumber = require('./insertIdentityNumber');
const insertPhoneNumber = require('./insertPhoneNumber');
const insertEmail = require('./insertEmail');
const insertAddress = require('./insertAddress');
const insertMunicipality = require('./insertMunicipality');
const insertProvince = require('./insertProvince');
const insertIdCardFront = require('./insertIdCardFront');
const insertIdCardBack = require('./insertIdCardBack');
const insertSelfiePhoto = require('./insertSelfiePhoto');
const insertDepositPhoto = require('./insertDepositPhoto');
const insertFacebook = require('./insertFacebook');

const mostrarInsertKYCMenu = async (ctx) => {
  const insertKYCMenu = Markup.inlineKeyboard([
    [
      Markup.button.callback('👤 Nombre Completo', 'insertName'),
      Markup.button.callback('🆔 Número de Identidad', 'insertIdentityNumber')
    ],
    [
      Markup.button.callback('📱 Número de Teléfono', 'insertPhoneNumber'),
      Markup.button.callback('📧 Correo Electrónico', 'insertEmail')
    ],
    [
      Markup.button.callback('🏠 Dirección', 'insertAddress'),
      Markup.button.callback('🌆 Municipio', 'insertMunicipality')
    ],
    [
      Markup.button.callback('🌍 Provincia', 'insertProvince'),
      Markup.button.callback('📄 Identificación (Frente)', 'insertIdCardFront')
    ],
    [
      Markup.button.callback('📄 Identificación (Atrás)', 'insertIdCardBack'),
      Markup.button.callback('🤳 Selfie', 'insertSelfiePhoto')
    ],
    [
      Markup.button.callback('💰 Comprobante de Pago', 'insertDepositPhoto'),
      Markup.button.callback('👤 Facebook', 'insertFacebook')
    ],
    [
      Markup.button.callback('❌ Cancelar', 'cancelKYC')
    ]
  ]);

  await ctx.reply('Seleccione lo que desea ingresar:', insertKYCMenu);
};

module.exports = {
  mostrarInsertKYCMenu,
  insertName,
  insertIdentityNumber,
  insertPhoneNumber,
  insertEmail,
  insertAddress,
  insertMunicipality,
  insertProvince,
  insertIdCardFront,
  insertIdCardBack,
  insertSelfiePhoto,
  insertDepositPhoto,
  insertFacebook
};
