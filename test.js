const { pool } = require('./psql/db');

async function obtenerUsuarios() {
  try {
    // Consultar la tabla de admines
    const query = 'SELECT id FROM listanegra_administradores ORDER BY id';
    const res = await pool.query(query);
    const admines = res.rows;

    // Obtener los nombres de los usuarios
    const usuarios = await Promise.all(admines.map(async admin => {
      const usuario = await bot.telegram.getChat(admin.id);
      return usuario;
    }));

    // Imprimir la lista de usuarios
    console.log('Usuarios:');
    usuarios.forEach(usuario => {
      console.log(`- ${usuario.first_name} (${usuario.id})`);
    });

  } catch (err) {
    console.error('Error al obtener los usuarios:', err);
  }
}

obtenerUsuarios();
