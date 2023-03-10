const { pool } = require('../psql/db');

const findIdByAlias = async (alias) => {
  try {
    const result = await pool.query(
      `SELECT id FROM monitorizacion_usuarios WHERE usuario = $1 ORDER BY tiempo DESC LIMIT 1`,
      [alias]
    );

    if (result.rows.length > 0) {
      return result.rows[0].id;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al buscar ID por alias', error);
    return null;
  }
};

module.exports = { findIdByAlias };

