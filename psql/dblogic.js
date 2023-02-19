const { pool } = require('./db');

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
  verificarRepeticionesIDNombres,
  verificarRepeticionesIDUsuarios,
  buscarCambiosCronologicosNombres,
  buscarCambiosCronologicosUsuarios,
};
