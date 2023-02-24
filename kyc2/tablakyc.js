const { pool } = require('../psql/db');

// Función para crear la tabla KYC en la base de datos
async function createKycTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS kycfirewallids (
        id SERIAL PRIMARY KEY,
        user_id BIGINT UNIQUE,
        name TEXT,
        identity_number TEXT,
        phone_number TEXT,
        email TEXT,
        address TEXT,
        municipality TEXT,
        province TEXT,
        id_card_front TEXT,
        id_card_back TEXT,
        selfie_photo TEXT,
        deposit_photo TEXT,
        facebook TEXT,
        terms_accepted BOOLEAN DEFAULT false,
        pending BOOLEAN DEFAULT true,
        approved BOOLEAN DEFAULT false,
        rejected BOOLEAN DEFAULT false,
        admin_id BIGINT
      );
    `);
    
  } finally {
    client.release();
  }
}

async function insertKycData(userId, name) {
  const query = {
    text: 'INSERT INTO kycfirewallids (user_id, name) VALUES ($1, $2)',
    values: [userId, name],
  };

  try {
    await pool.query(query);
    console.log('Datos KYC insertados correctamente!');
  } catch (err) {
    console.error('Error insertando datos KYC:', err.message);
  }
}

module.exports = { createKycTable, insertKycData };