const { pool } = require('../psql/db');

async function crearTablaCeoSucesor() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ceo_sucesor (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefono TEXT,
        foto TEXT,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('La tabla "ceo_sucesor" ha sido creada exitosamente!');
  } catch (error) {
    console.error('Error al crear la tabla "ceo_sucesor":', error);
  } finally {
    client.release();
  }
}

crearTablaCeoSucesor();
