const { pool } = require('../psql/db');

const insertKyc = async (aprobado, rechazado, esperando) => {
  const client = await pool.connect();
  try {
    const query = `INSERT INTO kycfirewallids (aprobado, rechazado, esperando) VALUES ($1, $2, $3) RETURNING *;`;
    const values = [aprobado, rechazado, esperando];
    const result = await client.query(query, values);
    console.log(`KYC insertado con éxito: ${result.rows[0].id}`);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error al insertar KYC', error);
  } finally {
    client.release();
  }
};

module.exports = {
  insertKyc,
};
