const { pool } = require('../psql/db');

async function insertProvince(userId, province) {
  const query = {
    text: 'INSERT INTO kycfirewallids(user_id, province) VALUES($1, $2) ON CONFLICT (user_id) DO UPDATE SET province = $2',
    values: [userId, province],
  };

  try {
    await pool.query(query);
    console.log('Provincia insertada correctamente!');
  } catch (err) {
    console.error('Error insertando provincia:', err.message);
  }
}

module.exports = {
  insertProvince,
};
