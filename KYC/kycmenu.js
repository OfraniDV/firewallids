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
    Markup.button.callback('📄 Fotos del KYC', 'kycarchivos'),
  ],
  [
    Markup.button.callback('👤 Facebook', 'insertFacebook'),
    Markup.button.callback('📤 Enviar a revisiones 🕵️‍♀️', 'enviarRevisiones'),
  ],
  [
    Markup.button.callback('❌ Cancelar', 'cancelKYC'),
  ],
]);

module.exports = { kycMenu };

  