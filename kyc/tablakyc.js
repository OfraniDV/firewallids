const { pool } = require('../psql/db');

// Función para crear la tabla KYC en la base de datos
async function createKycTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS kycfirewallids (
        id BIGINT PRIMARY KEY,
        name TEXT,
        identity_number TEXT,
        age INTEGER,
        date_of_birth DATE,
        phone_number TEXT,
        email TEXT,
        address TEXT,
        municipality TEXT,
        province TEXT,
        country TEXT,
        id_card_front TEXT,
        id_card_back TEXT,
        selfie_photo TEXT,
        signature_photo TEXT,
        family_photo TEXT,
        phone_bill TEXT,
        aprobado BOOLEAN DEFAULT false,
        rechazado BOOLEAN DEFAULT false,
        esperando BOOLEAN DEFAULT true,
        adminqaprueba BIGINT
      );
    `);
  } catch (err) {
    console.error('Error creating KYC table:', err.message);
  } finally {
    client.release();
  }
}

module.exports = { createKycTable };
