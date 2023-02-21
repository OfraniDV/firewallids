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

async function createTable() {
  try {
    await pool.query(createVotacionTable);
    console.log('Tabla "votacion" creada o ya existe');
  } catch (err) {
    console.error('Error al crear tabla "votacion"', err.stack);
  }
}
createTable();

// Crear un comando llamado /iniciarvotacion, solo puede ser utilizado por el CEO
async function iniciarVotacionCommand(ctx) {
  const ceoId = parseInt(process.env.ID_USER_OWNER);
  
  if (ctx.from.id !== ceoId) {
    return ctx.reply('Acceso denegado. Este comando solo puede ser utilizado por el CEO del bot.');
  }

  const saveVotationInfo = async (ceoId) => {
    try {
      const res = await pool.query(
        `INSERT INTO votacion (ceo_id, activo) VALUES ($1, true)`,
        [ceoId]
      );
      console.log('Votación iniciada con éxito');
      ctx.reply('Votación iniciada con éxito');
    } catch (err) {
      console.log(err.stack);
      ctx.reply('Ha ocurrido un error al iniciar la votación. Por favor inténtalo de nuevo.');
    }
  };

  await saveVotationInfo(ceoId);
}

module.exports = {
  iniciarVotacionCommand,
};
