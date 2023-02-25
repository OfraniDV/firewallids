const { pool } = require('../psql/db');

async function insertMunicipality(userId, municipality) {
  const query = {
    text: 'INSERT INTO kycfirewallids_municipality (user_id, municipality) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET municipality = $2',
    values: [userId, municipality],
  };

  try {
    await pool.query(query);
    console.log('Municipio insertado o actualizado correctamente!');
  } catch (err) {
    console.error('Error insertando o actualizando municipio:', err.message);
  }
}

module.exports = {
  insertMunicipality,
};
