const { Markup } = require('telegraf');
const kycMenu = Markup.inlineKeyboard([
  [
    Markup.button.callback('👤 Nombre Completo', 'insertName'),
    Markup.button.callback('🆔 Número de Identidad', 'insertIdentityNumber'),
  ],
  [
    Markup.button.callback('📱 Número de Teléfono', 'insertPhoneNumber'),
    Markup.button.callback('📧 Correo Electrónico', 'insertEmail'),
  ],
  [
    Markup.button.callback('🏠 Dirección', 'insertAddress'),
    Markup.button.callback('🌆 Municipio', 'insertMunicipality'),
  ],
  [
    Markup.button.callback('🌍 Provincia', 'insertProvince'),
    Markup.button.callback('📄 Identificación (Frente)', 'insertIdCardFront'),
  ],
  [
    Markup.button.callback('📄 Identificación (Atrás)', 'insertIdCardBack'),
    Markup.button.callback('🤳 Selfie', 'insertSelfiePhoto'),
  ],
  [
    Markup.button.callback('💰 Comprobante de Pago', 'insertDepositPhoto'),
    Markup.button.callback('👤 Facebook', 'insertFacebook'),
  ],
  [
    Markup.button.callback('📤 Enviar a revisiones 🕵️‍♀️', 'enviarRevisiones'),
  ],
  [
    Markup.button.callback('❌ Cancelar', 'cancelKYC'),
  ],
]);

module.exports = { kycMenu };

  