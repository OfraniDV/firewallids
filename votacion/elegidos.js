const { pool } = require('../psql/db');

async function createElegidosTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS elegidos (
      id_elector INTEGER,
      id_candidato INTEGER,
      UNIQUE (id_elector)
    )`;
    await pool.query(query);
    console.log('Tabla "elegidos" creada con éxito');
  } catch (err) {
    console.error('Error al crear tabla "elegidos":', err.message);
  }
}

module.exports = createElegidosTable;
