const { pool } = require('../psql/db');

// Comando para postularse como candidato
async function postularmeCommand(ctx) {
  const userId = ctx.from.id;

  try {
    const res = await pool.query('SELECT * FROM candidatos WHERE id=$1', [userId]);
    if (res.rows.length > 0) {
      // Si ya se ha postulado, envía un mensaje de error
      ctx.reply('Usted ya se encuentra como candidato a Vice del CEO, espere los resultados.');
    } else {
      // Si no se ha postulado, lo agrega a la tabla de candidatos
      const query = `INSERT INTO candidatos (id, nombre, vice_ceo) VALUES ($1, $2, $3)`;
      const values = [userId, ctx.from.first_name, true];
      await pool.query(query, values);

      // Envía un mensaje de confirmación
      ctx.reply('Usted se acaba de postular como candidato a Vice del CEO, espere los resultados.');
    }
  } catch (err) {
    console.log(err.stack);
    ctx.reply('Ha ocurrido un error al intentar postularse. Por favor inténtalo de nuevo más tarde.');
  }
}

module.exports = {
  postularmeCommand,
};
