const { pool } = require('../psql/db');

async function createCandidatosTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS candidatos (
      id BIGINT PRIMARY KEY,
      nombre TEXT,
<<<<<<< HEAD
=======
      idPosibleVC BIGINT,
>>>>>>> 98ce25cb7e58bcc3dbc0fb979286fa98b3e8938a
      vice_ceo BOOLEAN DEFAULT false,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await pool.query(query);
    console.log('Tabla "candidatos" creada con éxito');
  } catch (err) {
    console.error('Error al crear tabla "candidatos":', err.message);
  }
}

module.exports = createCandidatosTable;

