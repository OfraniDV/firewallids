const { pool } = require('./psql/db');

async function updateKyc() {
  try {
    const user = await pool.query('SELECT * FROM kycold');
    for (let i = 0; i < user.rows.length; i++) {
      const userId = user.rows[i].user_id;
      const exists = await pool.query('SELECT * FROM kycfirewallids WHERE user_id = $1', [userId]);
      if (exists.rows.length === 0) {
        await pool.query('INSERT INTO kycfirewallids (id, user_id, name, identity_number, phone_number, email, address, municipality, province, kycarchivos, facebook, terms_accepted, pending, approved, rejected, admin_id, created_at, updated_at) VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)', [userId, user.rows[i].name, user.rows[i].identity_number, user.rows[i].phone_number, user.rows[i].email, user.rows[i].address, user.rows[i].municipality, user.rows[i].province, user.rows[i].kycarchivos, user.rows[i].facebook, user.rows[i].terms_accepted, user.rows[i].pending, user.rows[i].approved, user.rows[i].rejected, user.rows[i].admin_id, user.rows[i].created_at, user.rows[i].updated_at]);
        console.log(`Fila insertada en la tabla kycfirewallids para el usuario con user_id ${userId}`);
      } else {
        console.log(`Fila no insertada en la tabla kycfirewallids para el usuario con user_id ${userId} porque ya existe en la tabla`);
      }
    }
  } catch (err) {
    console.error('Error actualizando KYC:', err.message);
  }
}

updateKyc();