const { pool } = require('../psql/db');

const createTable = async () => {
  const client = await pool.connect();
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS kycfirewallids (
        id SERIAL PRIMARY KEY,
        aprobado BOOLEAN,
        rechazado BOOLEAN,
        esperando BOOLEAN
      );
    `;
    await client.query(query);
    console.log('Tabla kycfirewallids creada con éxito!');
  } catch (error) {
    console.error('Error al crear tabla kycfirewallids', error);
  } finally {
    client.release();
  }
};

module.exports = {
  createTable,
};
