// votacion.js

// Comando para votaciones
function votacionCommand(ctx) {
  const message = '¿Qué desea hacer?\n1. Postularse: Ejecute /postularme\n2. Elegir: Ejecute /elegir\n3. Cancelar: /cancelar para salir en cualquier momento';
  ctx.replyWithMarkdown(message);
}

// Comando para cancelar
function cancelarCommand(ctx) {
  ctx.reply('¡Hasta luego!');
}


module.exports = {
  votacionCommand, cancelarCommand
};
