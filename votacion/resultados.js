const { pool } = require('../psql/db');
const { md, escapeMarkdown } = require('telegram-escape');

async function resultadosCommand(ctx) {
  try {
    const query = `SELECT activo FROM votacion ORDER BY id DESC LIMIT 1`;
    const res = await pool.query(query);
    const votacionActiva = res.rows.length > 0 && res.rows[0].activo;

    if (votacionActiva) {
      await ctx.reply('La votación aún está activa. Por favor espere a que finalice para ver los resultados.');
      return;
    }

    const votosQuery = `
      SELECT c.nombre, count(e.id_candidato) as votos
      FROM candidatos c
      LEFT JOIN elegidos e ON c.id = e.id_candidato
      GROUP BY c.id
      ORDER BY votos DESC
    `;
    const votosRes = await pool.query(votosQuery);
    const votos = votosRes.rows;

    if (votos.length === 0) {
      await ctx.reply('No se han registrado votos aún');
      return;
    }

    let mensaje = '📊 Resultados de la votación 📊\n\n';
    let posicion = 1;

    votos.forEach((candidato) => {
      mensaje += `${posicion}. ${escapeMarkdown(candidato.nombre)}: ${candidato.votos} votos\n`;
      posicion++;
    });

    await ctx.replyWithMarkdown(mensaje);
  } catch (err) {
    console.error('Error al procesar el comando resultados:', err);
    await ctx.reply('Ha ocurrido un error al procesar su solicitud. Por favor inténtelo de nuevo.');
  }
}

module.exports = {
  resultadosCommand,
};
