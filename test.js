const { pool } = require('./psql/db');
const { insertKycData } = require('./KYC/kyctabla');

// Datos intencionales
const userId = 123456789;
const data = {
  name: 'John Doe',
  identity_number: '1234567890123',
  phone_number: '555-1234',
  email: 'johndoe@example.com',
  address: '123 Main St.',
  municipality: 'Anytown',
  province: 'Anystate',
  id_card_front: 'http://example.com/id_card_front.jpg',
  id_card_back: 'http://example.com/id_card_back.jpg',
  selfie_photo: 'http://example.com/selfie_photo.jpg',
  deposit_photo: 'http://example.com/deposit_photo.jpg',
  facebook: 'https://www.facebook.com/johndoe',
  terms_accepted: true,
  pending: true,
  approved: false,
  rejected: false,
  admin_id: 987654321,
};

(async () => {
  try {
    const client = await pool.connect();
    await insertKycData(userId, data);
    client.release();
    console.log('Datos insertados exitosamente en la tabla KYC');
  } catch (err) {
    console.error('Error insertando datos KYC:', err.message);
  }
})();
