const { pool } = require('../psql/db');

async function insertSelfiePhoto(userId, selfiePhotoUrl) {
  const query = {
    text: 'UPDATE kycfirewallids SET selfie_photo=$2 WHERE user_id=$1',
    values: [userId, selfiePhotoUrl],
  };

  try {
    await pool.query(query);
    console.log('Foto selfie insertada correctamente!');
  } catch (err) {
    console.error('Error insertando foto selfie:', err.message);
  }
}

module.exports = {
  insertSelfiePhoto,
};
