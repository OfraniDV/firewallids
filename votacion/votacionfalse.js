require('dotenv').config();

const { pool } = require('../psql/db');

// Crear tabla "votacion" si no existe
const createVotacionTable = `
  CREATE TABLE IF NOT EXISTS votacion (
    id SERIAL PRIMARY KEY,
    ceo_id BIGINT NOT NULL,
    activo BOOLEAN NOT NULL
  )
`;

async function desactivarVotacion(ctx) {
  const ceoId = process.env.ID_USER_OWNER;

  if (ctx.from.id != ceoId) {
    return ctx.reply('🚨 Acceso denegado 🚨\n\nEste comando solo puede ser utilizado por el CEO del bot.');
  }

  try {
    const res = await pool.query('SELECT * FROM votacion WHERE activo = true');
    if (res.rows.length == 0) {
      return ctx.reply('No hay votaciones activas.');
    }
    const id = res.rows[0].id;
    const query = 'UPDATE votacion SET activo = false WHERE id = $1';
    await pool.query(query, [id]);
    return ctx.reply('La votación ha sido desactivada.');
  } catch (err) {
    console.error('Error al desactivar votación', err.stack);
    return ctx.reply('Ha ocurrido un error al desactivar la votación. Por favor inténtalo de nuevo.');
  }
}

module.exports = {
  desactivarVotacion,
};
