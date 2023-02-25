const { pool } = require('../psql/db');

async function insertFacebook(userId, facebook) {
  const query = {
    text: 'UPDATE kycfirewallids SET facebook=$2 WHERE user_id=$1',
    values: [userId, facebook],
  };

  try {
    await pool.query(query);
    console.log(`Facebook insertado correctamente para el usuario con id ${userId}`);
  } catch (err) {
    console.error(`Error insertando Facebook para el usuario con id ${userId}: ${err.message}`);
  }
}

module.exports = {
  insertFacebook,
};
