const { pool } = require('../psql/db');
const fs = require('fs');

async function getUserResponses(userId) {
  const query = 'SELECT * FROM kycfirewallids WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  const userKYCData = result.rows[0];

  if (!userKYCData) {
    throw new Error(`No se encontraron respuestas KYC para el usuario con ID ${userId}`);
  }

  const responses = [
    { question: 'Nombre completo', answer: userKYCData.name },
    { question: 'Número de identificación', answer: userKYCData.identity_number },
    { question: 'Número de teléfono', answer: userKYCData.phone_number },
    { question: 'Correo electrónico', answer: userKYCData.email },
    { question: 'Dirección', answer: userKYCData.address },
    { question: 'Municipio', answer: userKYCData.municipality },
    { question: 'Provincia', answer: userKYCData.province },
    { question: 'Facebook', answer: userKYCData.facebook }
  ];

  // Convertir las fotos de bytea a archivos legibles por humanos
  const photos = [
    { column: 'id_card_front', label: 'Foto del frente de la cédula' },
    { column: 'id_card_back', label: 'Foto del reverso de la cédula' },
    { column: 'selfie_photo', label: 'Foto de la selfie con el papel en blanco' },
    { column: 'deposit_photo', label: 'Foto del comprobante de depósito' }
  ];

  for (const { column, label } of photos) {
    const photoData = userKYCData[column];
    if (photoData) {
      const photoName = `${userKYCData.user_id}_${column}.jpg`;
      fs.writeFileSync(photoName, photoData);
      responses.push({ question: label, answer: { photoName, photoData } });
    }
  }

  return responses;
}

module.exports = { getUserResponses };
