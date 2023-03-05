const { pool } = require('../psql/db');
const path = require('path');

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
    { question: 'Facebook', answer: userKYCData.facebook },
    { question: 'Archivo KYC', answer: path.parse(file.file_path).base }
  ];

  return responses;
}

module.exports = { getUserResponses };
