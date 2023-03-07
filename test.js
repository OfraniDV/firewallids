const { pool } = require('./psql/db');

const getUsers = async () => {
  try {
    const result = await pool.query(
      `SELECT usuario_id, usuario_usuario, usuario_nombre FROM identidades WHERE estado = 1`
    );
    console.log(`Usuarios encontrados:`);
    console.table(result.rows);
  } catch (err) {
    console.error(`Error al obtener los usuarios: ${err}`);
  }
};

getUsers();
