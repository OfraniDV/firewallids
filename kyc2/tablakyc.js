const { pool } = require('../psql/db');

// Creamos la tabla KYC si no existe
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
    console.log('Tabla KYC creada exitosamente!');
  } catch (err) {
    console.error('Error creando tabla KYC:', err.message);
  } finally {
    client.release();
  }
}

// Insertamos datos en la tabla KYC
async function insertKycData(data) {
  const {
    userId,
    name,
    identityNumber,
    phoneNumber,
    email,
    address,
    municipality,
    province,
    idCardFront,
    idCardBack,
    selfiePhoto,
    depositPhoto,
    facebook,
    termsAccepted = false,
    pending = true,
    approved = false,
    rejected = false,
    adminId,
  } = data;

  const query = {
    text: `INSERT INTO kycfirewallids (user_id, name, identity_number, phone_number, email, address, municipality, province, id_card_front, id_card_back, selfie_photo, deposit_photo, facebook, terms_accepted, pending, approved, rejected, admin_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
    values: [
      userId,
      name,
      identityNumber,
      phoneNumber,
      email,
      address,
      municipality,
      province,
      idCardFront,
      idCardBack,
      selfiePhoto,
      depositPhoto,
      facebook,
      termsAccepted,
      pending,
      approved,
      rejected,
      adminId,
    ],
  };

  try {
    await pool.query(query);
    console.log('Datos KYC insertados correctamente!');
  } catch (err) {
    console.error('Error insertando datos KYC:', err.message);
  }
}

module.exports = {
  createKycTable,
  insertKycData,
};
