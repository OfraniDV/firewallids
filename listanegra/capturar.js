const fs = require('fs');
const { promisify } = require('util');
const { pool } = require('../psql/db');

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

async function capturar(ctx) {
  const { from } = ctx;

  // Verificar si el ID del usuario que ejecutó el comando se encuentra en la lista blanca de administradores
  const adminResult = await pool.query('SELECT * FROM listanegra_administradores WHERE id = $1', [from.id]);
  if (adminResult.rows.length === 0) {
    // Si el ID del usuario no se encuentra en la lista blanca de administradores, mostrar un mensaje de acceso denegado
    return ctx.reply('Acceso denegado');
  }

  // Si el ID del usuario se encuentra en la lista blanca de administradores, buscar los usuarios en la lista negra
  const usuariosResult = await pool.query('SELECT * FROM listanegra');
  const usuariosEnListaNegra = usuariosResult.rows.map((row) => row.id);

  // Buscar los grupos asociados a los usuarios en la lista negra
  const grupos = [];
  for (let i = 0; i < usuariosEnListaNegra.length; i++) {
    const usuarioEnListaNegra = usuariosEnListaNegra[i];
    const gruposResult = await pool.query('SELECT grupo FROM monitorizacion_usuarios_grupos WHERE usuario = $1', [usuarioEnListaNegra]);
    const gruposUsuario = gruposResult.rows.map((row) => row.grupo);
    if (gruposUsuario.length > 0) {
      grupos.push({ usuario: usuarioEnListaNegra, grupos: gruposUsuario });
    }
  }

  // Si no se encuentran grupos asociados a ningún usuario en la lista negra, mostrar un mensaje con un emoji de tristeza
  if (grupos.length === 0) {
    return ctx.reply('Lo siento, no se encontraron usuarios en esta búsqueda 😔');
  }

  // Si se encuentran grupos asociados a usuarios en la lista negra, crear el mensaje y adjuntarlo como un archivo
  const mensaje = grupos
    .map(({ usuario, grupos }) => `El usuario con ID ${usuario} se encuentra en los siguientes grupos:\n\n- ${grupos.join('\n- ')}\n`)
    .join('\n');

  const fecha = new Date().toLocaleString('es-CU', { timeZone: 'America/Havana', dateStyle: 'short', timeStyle: 'short' });
  const informe = `${fecha}\n\n${mensaje}`;
  const nombreArchivo = `informe-${from.id}.txt`;
  const rutaArchivo = `./${nombreArchivo}`;
  await writeFile(rutaArchivo, informe);
  const informeAdjunto = {
    source: rutaArchivo,
    filename: 'informe.txt',
  };
  await ctx.telegram.sendDocument(process.env.ID_GROUP_ADMIN, informeAdjunto, { caption: 'Informe completo disponible en el archivo adjunto' });

  // Eliminar el archivo temporal después de enviar el mensaje
  await unlink(rutaArchivo);
}

module.exports = { capturar };
