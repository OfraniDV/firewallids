const { Markup, Composer } = require('telegraf');

const postulacionMenu = Markup.keyboard(['🐉 Postularse como Vice del CEO', '✍️ Postularse como Revisor de KYC'])
  .oneTime()
  .resize()
  .extra();

const confirmationMenu = Markup.inlineKeyboard([
  Markup.callbackButton('Sí, confirmo mi postulación', 'confirm_postulacion'),
  Markup.callbackButton('No, cambiar mi postulación', 'change_postulacion'),
]);

const postularseHandler = new Composer();

postularseHandler.hears('🐉 Postularse como Vice del CEO', async (ctx) => {
  ctx.session.cargo = 'Vice del CEO';
  await ctx.reply('🐉 ¿Estás seguro que deseas postularte para el cargo de Vice del CEO?', confirmationMenu);
});

postularseHandler.hears('✍️ Postularse como Revisor de KYC', async (ctx) => {
  ctx.session.cargo = 'Revisor de KYC';
  await ctx.reply('✍️ ¿Estás seguro que deseas postularte para el cargo de Revisor de KYC?', confirmationMenu);
});

const menuHandler = new Composer();

menuHandler.start(async (ctx) => {
  await ctx.reply('🗳️ Votaciones\n\n👤 ¿Qué acción deseas realizar?', postulacionMenu);
});

menuHandler.hears('👤 Volver al Menú Principal', async (ctx) => {
  await ctx.reply('🗳️ Votaciones\n\n👤 ¿Qué acción deseas realizar?', postulacionMenu);
});

menuHandler.hears('🗳️ Ver resultados de la votación', async (ctx) => {
  await ctx.reply('⚖️ Los resultados de la votación estarán disponibles una vez finalizada la votación.');
});

const confirmationHandler = new Composer();

confirmationHandler.action('confirm_postulacion', async (ctx) => {
  const cargo = ctx.session.cargo;
  const nombre = ctx.from.first_name;
  const apellido = ctx.from.last_name;
  const alias = ctx.from.username;
  try {
    await pool.query('INSERT INTO candidatos (nombre, apellido, alias_telegram, cargo) VALUES ($1, $2, $3, $4)', [nombre, apellido, alias, cargo]);
    await ctx.reply(`👍 Perfecto, has sido registrado como postulante para el cargo de ${cargo}.`);
  } catch (err) {
    console.log(err.stack);
    await ctx.reply('Ha ocurrido un error al registrar tu postulación. Por favor inténtalo de nuevo más tarde.');
  }
});

confirmationHandler.action('change_postulacion', async (ctx) => {
  await ctx.reply('🗳️ Votaciones\n\n👤 ¿Qué acción deseas realizar?', postulacionMenu);
});

const votacionPostulacionBot = new Composer();

votacionPostulacionBot.use(postularseHandler);
votacionPostulacionBot.use(confirmationHandler);
votacionPostulacionBot.use(menuHandler);

module.exports = votacionPostulacionBot;
