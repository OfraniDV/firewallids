const { Scenes } = require('telegraf');
const fs = require('fs');
const axios = require('axios');

function createKycPhotoScene(columnName) {
  const kycPhotoScene = new Scenes.BaseScene(columnName);

  kycPhotoScene.enter((ctx) => {
    ctx.reply(`Por favor, envía una foto del ${columnName}`);
  });

  kycPhotoScene.on('photo', async (ctx) => {
    if (ctx.message.chat.type !== 'private' || ctx.from.id !== ctx.message.from.id) {
      return;
    }

    const userId = BigInt(ctx.from.id);
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const file = await ctx.telegram.getFile(fileId);
    const downloadUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
    const filePath = `./KYC/kycimg/${columnName}_${userId}.jpg`;

    // Descargar la imagen y guardarla en el sistema de archivos local
    const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, response.data);

    // Leer el archivo y convertirlo a un objeto Buffer
    const buffer = fs.readFileSync(filePath);

    // Actualizar la columna correspondiente con el objeto Buffer
    try {
      const query = `UPDATE kycfirewallids SET ${columnName} = $1 WHERE user_id = $2`;
      await pool.query(query, [buffer, userId]);
      await ctx.reply(`¡Gracias por proporcionar la foto del ${columnName}!`);
    } catch (err) {
      console.error('Error actualizando datos KYC:', err.message);
      await ctx.reply('Lo siento, ha habido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.');

      // Registra el error en un archivo de registro de errores
      const errorMsg = `${new Date().toISOString()} - Error actualizando datos KYC: ${err.message}\n`;
      console.error(errorMsg);
    }

    // Sale de la escena
    ctx.scene.leave();
  });

  return kycPhotoScene;
}

module.exports = {
  createKycPhotoScene,
};
