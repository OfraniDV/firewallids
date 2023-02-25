const { pool } = require('../psql/db');
const { insertName } = require('./insertName');
const { insertIdentityNumber } = require('./insertIdentityNumber');
const { insertPhoneNumber } = require('./insertPhoneNumber');
const { insertEmail } = require('./insertEmail');
const { insertAddress } = require('./insertAddress');
const { insertMunicipality } = require('./insertMunicipality');
const { insertProvince } = require('./insertProvince');
const { insertIdCardFront } = require('./insertIdCardFront');
const { insertIdCardBack } = require('./insertIdCardBack');
const { insertSelfiePhoto } = require('./insertSelfiePhoto');
const { insertDepositPhoto } = require('./insertDepositPhoto');
const { insertFacebook } = require('./insertFacebook');

async function createKycTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS kycfirewallids (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users (id),
        name VARCHAR(100) NOT NULL,
        identity_number VARCHAR(20) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        municipality VARCHAR(50) NOT NULL,
        province VARCHAR(50) NOT NULL,
        id_card_front TEXT NOT NULL,
        id_card_back TEXT NOT NULL,
        selfie_photo TEXT NOT NULL,
        deposit_photo TEXT NOT NULL,
        facebook TEXT NOT NULL,
        terms_accepted BOOLEAN NOT NULL,
        pending BOOLEAN NOT NULL,
        approved BOOLEAN NOT NULL,
        rejected BOOLEAN NOT NULL,
        admin_id INTEGER REFERENCES admins (id),
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

async function insertKycData(userId, data) {
  // desestructurar la data
  const {
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
    terms_accepted = false,
    pending = true,
    approved = false,
    rejected = false,
    admin_id,
  } = data;

  // llamar a las funciones de inserción correspondientes
  if (name) {
    await insertName(userId, name);
  }
  if (identity_number) {
    await insertIdentityNumber(userId, identity_number);
  }
  if (phone_number) {
    await insertPhoneNumber(userId, phone_number);
  }
  if (email) {
    await insertEmail(userId, email);
  }
  if (address) {
    await insertAddress(userId, address);
  }
  if (municipality) {
    await insertMunicipality(userId, municipality);
  }
  if (province) {
    await insertProvince(userId, province);
  }
  if (id_card_front) {
    await insertIdCardFront(userId, id_card_front);
  }
  if (id_card_back) {
    await insertIdCardBack(userId, id_card_back);
  }
  if (selfie_photo) {
    await insertSelfiePhoto(userId, selfie_photo);
  }
  if (deposit_photo) {
    await insertDepositPhoto(userId, deposit_photo);
  }
  if (facebook) {
    await insertFacebook(userId, facebook);
  }

  // actualizar el resto de las columnas con una única consulta
  const query = {
    text: `UPDATE kycfirewallids SET 
      email=$2, 
      address=$3, 
      municipality=$4, 
      province=$5, 
      id_card_front=$6, 
      id_card_back=$7, 
      selfie_photo=$8, 
      deposit_photo=$9, 
      facebook=$10, 
      terms_accepted=$11, 
      pending=$12, 
      approved=$13, 
      rejected=$14, 
      admin_id=$15
      WHERE user_id=$1`,
    values: [
      userId,
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
      admin_id,
    ],
  };

  try {
    await pool.query(query);
    console.log('Datos KYC insertados o actualizados correctamente!');
  } catch (err) {
    console.error('Error insertando o actualizando datos KYC:', err.message);
  }
}

module.exports = {
  createKycTable,
  insertKycData,
};
``