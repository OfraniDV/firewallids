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

async function verificarRepeticionesIDNombres(id) {
  const query = {
    text: 'SELECT COUNT(*) FROM monitorizacion_nombres WHERE id = $1',
    values: [id]
  };

  try {
    const result = await pool.query(query);
    return result.rows[0].count;
  } catch (error) {
    console.error(`Error al verificar repeticiones de ID en la base de datos: ${error}`);
  }
}

async function verificarRepeticionesIDUsuarios(id) {
  const query = {
    text: 'SELECT COUNT(*) FROM monitorizacion_usuarios WHERE id = $1',
    values: [id]
  };

  try {
    const result = await pool.query(query);
    return result.rows[0].count;
  } catch (error) {
    console.error(`Error al verificar repeticiones de ID en la base de datos: ${error}`);
  }
}

async function buscarCambiosCronologicosNombres(id) {
  const query = {
    text: 'SELECT * FROM monitorizacion_nombres WHERE id = $1 ORDER BY tiempo ASC',
    values: [id],
  };

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error(`Error al buscar cambios cronológicos de nombres en la base de datos: ${error}`);
  }
}

async function buscarCambiosCronologicosUsuarios(id) {
  const query = {
    text: 'SELECT * FROM monitorizacion_usuarios WHERE id = $1 ORDER BY tiempo ASC',
    values: [id],
  };

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error(`Error al buscar cambios cronológicos de usuarios en la base de datos: ${error}`);
  }
}

module.exports = {
  agregarUsuario,
  verificarRepeticionesIDNombres,
  verificarRepeticionesIDUsuarios,
  buscarCambiosCronologicosNombres,
  buscarCambiosCronologicosUsuarios,
};
