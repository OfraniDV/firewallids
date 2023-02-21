const { pool } = require('../db');

async function crearTablaLogUsuarios() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS logusuarios (
        id SERIAL PRIMARY KEY,
        usuario_id BIGINT NOT NULL,
        nombre TEXT NOT NULL,
        alias TEXT,
        primera_vez TIMESTAMP NOT NULL,
        ultima_vez TIMESTAMP NOT NULL
      );
    `);
    console.log('Tabla logusuarios creada o ya existente');
  } finally {
    client.release();
  }
}

async function insertarLogUsuario(usuario) {
  const client = await pool.connect();
  try {
    const { id, first_name, last_name, username } = usuario;
    const result = await client.query(`
      INSERT INTO logusuarios (usuario_id, nombre, alias, primera_vez, ultima_vez)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (usuario_id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        alias = EXCLUDED.alias,
        ultima_vez = EXCLUDED.ultima_vez
      RETURNING id;
    `, [id, `${first_name} ${last_name}`, username]);
    console.log(`Registro insertado en logusuarios con id ${result.rows[0].id}`);
  } finally {
    client.release();
  }
}

module.exports = { crearTablaLogUsuarios, insertarLogUsuario };
