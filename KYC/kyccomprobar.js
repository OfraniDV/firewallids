const { pool } = require('./psql/db');

async function checkKYC(userId) {
  const query = 'SELECT * FROM kycfirewallids WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  const userKYCData = result.rows[0];

  const missingFields = [];
  if (!userKYCData.name) {
    missingFields.push('nombre completo');
  }
  if (!userKYCData.identity_number) {
    missingFields.push('número de identificación');
  }
  if (!userKYCData.phone_number) {
    missingFields.push('número de teléfono');
  }
  if (!userKYCData.email) {
    missingFields.push('correo electrónico');
  }
  if (!userKYCData.address) {
    missingFields.push('dirección');
  }
  if (!userKYCData.municipality) {
    missingFields.push('municipio');
  }
  if (!userKYCData.province) {
    missingFields.push('provincia');
  }
  if (!userKYCData.id_card_front) {
    missingFields.push('foto del frente de la cédula');
  }
  if (!userKYCData.id_card_back) {
    missingFields.push('foto del reverso de la cédula');
  }
  if (!userKYCData.selfie_photo) {
    missingFields.push('foto de la selfie con el papel en blanco');
  }
  if (!userKYCData.deposit_photo) {
    missingFields.push('foto del comprobante de depósito');
  }
  if (!userKYCData.facebook) {
    missingFields.push('enlace al perfil de Facebook');
  }

  let responseMsg = `*Comprobación KYC*\n\nLos siguientes campos están incompletos en la base de datos para el usuario con ID ${userId}:\n\n`;

  if (missingFields.length === 0) {
    responseMsg = `Los campos para el usuario con ID ${userId} están completos. ¡Gracias por su colaboración!`;
  } else {
    for (const field of missingFields) {
      responseMsg += `• ${field}\n`;
    }
    responseMsg += '\nPor favor, envía los campos faltantes lo más pronto posible. Una vez que todos los campos estén completos, tu solicitud de verificación de KYC será procesada.';
  }

  return responseMsg;
}

module.exports = { checkKYC };
