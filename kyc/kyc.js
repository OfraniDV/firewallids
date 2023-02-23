const { insertKyc } = require('./queries');

// Función que se ejecuta cuando se recibe el comando de iniciar el KYC
const iniciarKyc = async (ctx) => {
  // código para hacer preguntas y recibir respuestas del usuario

  // Al finalizar el KYC, se pueden insertar los valores en la base de datos
  const kycId = await insertKyc(false, false, true);
  console.log(`KYC insertado con ID ${kycId}`);
};

module.exports = {
  iniciarKyc
};
