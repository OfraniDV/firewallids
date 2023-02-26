const { pool } = require('../psql/db');

async function createKycTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS kycfirewallids (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL UNIQUE,
        name TEXT,
        identity_number VARCHAR(20),
        phone_number VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        municipality VARCHAR(50),
        province VARCHAR(50),
        id_card_front BYTEA,
        id_card_back BYTEA,
        selfie_photo BYTEA,
        deposit_photo BYTEA,
        facebook TEXT,
        terms_accepted BOOLEAN ,
        pending BOOLEAN ,
        approved BOOLEAN ,
        rejected BOOLEAN ,
        admin_id BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await pool.query(query);
    console.log('Tabla KYC creada exitosamente!');
  } catch (err) {
    console.error('Error creando tabla KYC:', err.message);
  }
}

async function insertKycData(userId, name, identityNumber, phoneNumber, email, address, municipality, province, idCardFront, idCardBack, selfiePhoto, depositPhoto, facebook, termsAccepted, pending, approved, rejected, adminId) {
  const { text, values } = {
    text: `
      INSERT INTO kycfirewallids (
        user_id,
        name,
        identity_number,
        phone_number,
        email,
        address,
        municipality,
        province,
        id_card_front,
        id_card_back,
        selfie_photo,
        deposit_photo,
        facebook,
        terms_accepted,
        pending,
        approved,
        rejected,
        admin_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (user_id) DO UPDATE SET 
        name=$2, 
        identity_number=$3,
        phone_number=$4,
        email=$5,
        address=$6,
        municipality=$7,
        province=$8,
        id_card_front=$9,
        id_card_back=$10,
        selfie_photo=$11,
        deposit_photo=$12,
        facebook=$13,
        terms_accepted=$14,
        pending=$15,
        approved=$16,
        rejected=$17,
        admin_id=$18,
        updated_at=NOW()
    `,
    values: [
      userId,
      name,
      identityNumber,
      phoneNumber,
      email,
      address,
      municipality,
      province,
      idCardFront || null,
      idCardBack || null,
      selfiePhoto || null,
      depositPhoto || null,
      facebook || null,
      termsAccepted,
      pending,
      approved,
      rejected,
      adminId || null,
    ],
  };

  try {
    await pool.query(text, values);
    console.log('Datos KYC insertados o actualizados correctamente!');
  } catch (err) {
    console.error('Error insertando o actualizando datos KYC:', err.message);
  }
}

module.exports = {
  createKycTable,
  insertKycData,
};
