const { pool } = require('./db');

async function agregarUsuario(id, nombre) {
  const query = {
    text: 'INSERT INTO usuarios (id, nombre) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    values: [id, nombre]
  };

  try {
    const result = await pool.query(query);
    console.log(`Se agregó el usuario con ID ${id} a la base de datos`);
  } catch (error) {
    console.error(`Error al agregar usuario a la base de datos: ${error}`);
  }
}

module.exports = { agregarUsuario };
