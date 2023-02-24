const { pool } = require('../psql/db');

const insertKyc = async (userId, data) => {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO kycfirewallids (
        user_id,
        name, 
        identity_number, 
        age, 
        date_of_birth, 
        phone_number, 
        email, 
        address, 
        municipality, 
        province, 
        country, 
        id_card_front, 
        id_card_back, 
        selfie_photo, 
        signature_photo, 
        family_photo, 
        phone_bill,
        esperando,
        adminqaprueba
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, true, null
      )
      RETURNING id;
    `;
    const values = [
      userId,
      data.name,
      data.identity_number,
      data.age,
      data.date_of_birth,
      data.phone_number,
      data.email,
      data.address,
      data.municipality,
      data.province,
      data.country,
      data.id_card_front,
      data.id_card_back,
      data.selfie_photo,
      data.signature_photo,
      data.family_photo,
      data.phone_bill,
    ];
    const res = await client.query(query, values);
    return res.rows[0].id;
  } catch (err) {
    console.error('Error inserting KYC data:', err.message);
  } finally {
    client.release();
  }
};

const updateKycApproval = async (kycId, approved, adminId) => {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE kycfirewallids 
      SET 
        aprobado = $1,
        rechazado = $2,
        esperando = $3,
        adminqaprueba = $4
      WHERE id = $5
    `;
    const values = [
      approved,
      !approved,
      false,
      adminId,
      kycId,
    ];
    await client.query(query, values);
    console.log(`KYC con ID ${kycId} actualizado exitosamente!`);
  } catch (err) {
    console.error('Error updating KYC data:', err.message);
  } finally {
    client.release();
  }
};

const actualizarEstadoProceso = async (userId) => {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE kycfirewallids 
      SET 
        esperando = $1
      WHERE user_id = $2
    `;
    const values = [false, userId];
    await client.query(query, values);
  } catch (err) {
    console.error('Error actualizando estado de proceso:', err.message);
  } finally {
    client.release();
  }
};

module.exports = {
  insertKyc,
  updateKycApproval,
  actualizarEstadoProceso,
};
