const { buscarCambiosUsuarioPorNombres } = require('../psql/dbcambN');
const { buscarCambiosUsuarioPorAlias } = require('../psql/dbcambA');

// ID a buscar
const userId = 45743297;

// Buscamos los cambios de nombres y usuarios para el ID especificado
const cambiosNombres = await buscarCambiosNombres(userId);
const cambiosUsuarios = await buscarCambiosUsuario(userId);

// Si el usuario tiene registros en ambas tablas, mostramos la información
if (cambiosNombres.length > 0 && cambiosUsuarios.length > 0) {
  // Obtenemos el nombre y alias actuales del usuario
  const nombreActual = cambiosNombres[cambiosNombres.length - 1].nombres;
  const aliasActual = cambiosUsuarios[cambiosUsuarios.length - 1].nombres;

  // Creamos el mensaje inicial con la información del ID y los nombres y alias actuales
  let mensaje = `El ID: ${userId} tiene por nombre actualmente: ${nombreActual} y su @alias es: ${aliasActual}\n\n`;

  // Agregamos los registros de cambios de nombres
  mensaje += 'Cambios de nombres:\n';
  cambiosNombres.forEach(cambio => {
    mensaje += `- ${cambio.nombres} - ${cambio.tiempo}\n`;
  });

  // Agregamos los registros de cambios de alias
  mensaje += '\nCambios de @alias:\n';
  cambiosUsuarios.forEach(cambio => {
    mensaje += `- ${cambio.nombres} - ${cambio.tiempo}\n`;
  });

  // Enviamos el mensaje al usuario
  ctx.reply(mensaje);
} else {
  // Si el usuario no tiene registros en alguna de las tablas, mostramos un mensaje indicando que no se encontraron cambios
  ctx.reply(`El ID: ${userId} no tiene cambios registrados en nuestras bases de datos.`);
}
