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
  } catch (err) {
    console.error('Error creating KYC table:', err.message);
  } finally {
    client.release();
  }
}

// Función para actualizar la información del KYC de un usuario
async function updateKyc(user_id, column, value) {
  const client = await pool.connect();
  try {
    await client.query(`UPDATE kycfirewallids SET ${column} = $1 WHERE user_id = $2`, [value, user_id]);
  } catch (err) {
    console.error('Error actualizando la información del KYC:', err.message);
  } finally {
    client.release();
  }
}

module.exports = { createKycTable, updateKyc };
