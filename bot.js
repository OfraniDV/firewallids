const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Comando /start
bot.start((ctx) => {
  const firstName = ctx.from.first_name;
  const message = `¡Hola ${firstName}! Bienvenido a nuestro bot de seguridad. ¿En qué puedo ayudarte?`;
  const menuOptions = [
    ['🤖 Ayuda sobre comandos'],
    ['🔍 Hacer KYC'],
    ['🌐 Web', '🚫 Denuncias', '🛡 Reclamaciones'],
    ['📣 Reportes', '💬 Recomendados', '📜 Reglas'],
    ['💰 Donación', '🚪 Salir']
  ];

  ctx.reply(message, {
    reply_markup: {
      keyboard: menuOptions,
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Submenú de Ayuda sobre comandos
bot.hears('🤖 Ayuda sobre comandos', (ctx) => {
  const menuOptions = [
    ['👤 Comandos para usuarios'],
    ['👥 Comandos para administradores'],
    ['↩️ Menu anterior']
  ];

  ctx.reply('Selecciona una opción del submenú:', {
    reply_markup: {
      keyboard: menuOptions,
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Submenú de Hacer KYC
bot.hears('🔍 Hacer KYC', (ctx) => {
  const menuOptions = [
    ['✅ Aceptar', '❌ Rechazar'],
    ['↩️ Menu anterior']
  ];

  const termsAndConditions = `Lee atentamente los términos y condiciones de uso del bot:

1. El KYC es obligatorio para todos los usuarios.
2. Los datos proporcionados deben ser reales y verídicos.
3. Toda la información suministrada es confidencial y será utilizada únicamente para los fines establecidos en el bot.

¿Aceptas los términos y condiciones?`;

  ctx.reply(termsAndConditions, {
    reply_markup: {
      keyboard: menuOptions,
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Opción Web
bot.hears('🌐 Web', (ctx) => {
  const url = process.env.URL;
  ctx.replyWithHTML(`Aquí tienes el enlace a nuestra web: <a href="${url}">${url}</a>`);
});

// Opción Denuncias
bot.hears('🚫 Denuncias', (ctx) => {
  const idGroupDenuncias = process.env.ID_GROUP_DENUNCIAS;
  ctx.replyWithHTML(`Dirígete a nuestro grupo de denuncias para reportar cualquier problema: <a href="https://t.me/${idGroupDenuncias}">${idGroupDenuncias}</a>`);
});

// Opción Reclamaciones
bot.hears('🛡 Reclamaciones', (ctx) => {
    const { id } = ctx.chat;
    const { ID_GROUP_RECLAMAR } = process.env;
  
    if (id.toString() === ID_GROUP_RECLAMAR) {
      ctx.reply('Este es el grupo de reclamaciones');
    } else {
      ctx.reply(`Por favor, dirígete al grupo de reclamaciones: https://t.me/${ID_GROUP_RECLAMAR}`);
    }
  });
  
  // Opción Reportes
  bot.hears('📝 Reportes', (ctx) => {
    const { id } = ctx.chat;
    const { ID_CHANNEL_REPORTS } = process.env;
  
    if (id.toString() === ID_CHANNEL_REPORTS) {
      ctx.reply('Este es el canal de reportes');
    } else {
      ctx.reply(`Por favor, dirígete al canal de reportes: https://t.me/${ID_CHANNEL_REPORTS}`);
    }
  });
  
  // Opción Grupos recomendados
  bot.hears('🌟 Grupos Recomendados', (ctx) => {
    const { id } = ctx.chat;
    const { ID_CHANNEL_RECOMENDADOS } = process.env;
  
    if (id.toString() === ID_CHANNEL_RECOMENDADOS) {
      ctx.reply('Estos son los grupos recomendados');
    } else {
      ctx.reply(`Por favor, dirígete al canal de grupos recomendados: https://t.me/${ID_CHANNEL_RECOMENDADOS}`);
    }
  });
  
  // Opción Reglas
  bot.hears('📜 Reglas', (ctx) => {
    ctx.reply('Estas son las reglas:');
    // Aquí se puede colocar un mensaje con las reglas predefinidas
  });
  
  // Opción Donaciones
  bot.hears('💰 Donaciones', (ctx) => {
    ctx.reply('Próximamente...');
  });
  
  // Opción Salir
  bot.hears('👋 Salir', (ctx) => {
    ctx.reply(`¡Hasta luego ${ctx.from.first_name}! ¡Gracias por interactuar con el bot! Si quieres volver a iniciar el bot, usa el comando /iniciar o /start`);
  });
  




  bot.launch();
