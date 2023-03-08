
const updateIdentidad = async () => {
  try {
    const query = `
      UPDATE identidades
      SET documento_identidad_numero = kycfirewallids.identity_number
      FROM kycfirewallids
      WHERE identidades.usuario_id = kycfirewallids.user_id;
    `;
    await pool.query(query);
    console.log('Update de documento de identidad completado');
  } catch (error) {
    console.error('Error al actualizar documento de identidad:', error);
  }
};

module.exports = { updateIdentidad };




const updateProvincia = async () => {
  try {
    const query = `UPDATE identidades SET direccion_region = kycfirewallids.province, direccion_codigo_pais = 'CU' 
                    FROM kycfirewallids WHERE kycfirewallids.user_id = identidades.usuario_id`;
    const result = await pool.query(query);
    console.log(`Se actualizaron ${result.rowCount} filas en la tabla identidades en la columna direccion_region y direccion_codigo_pais.`);
  } catch (error) {
    console.error('Error en updateProvincia: ', error);
  }
}

module.exports = { updateProvincia };


const updateMunicipio = async () => {
  try {
    const client = await pool.connect();
    const query = `
      UPDATE identidades
      SET direccion_localidad = kycfirewallids.municipality
      FROM kycfirewallids
      WHERE identidades.usuario_id = kycfirewallids.user_id
    `;
    await client.query(query);
    console.log('Municipio actualizado en identidades');
    client.release();
  } catch (error) {
    console.error(error);
  }
};

module.exports = { updateMunicipio };

async function updateNameFull() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT kycfirewallids.user_id, kycfirewallids.name FROM kycfirewallids WHERE kycfirewallids.approved = true');
    const users = result.rows;
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const name = user.name.trim().split(' ');

      if (name.length === 4) {
        const firstName = name[0];
        const secondName = name[1];
        const lastName = `${name[2]} ${name[3]}`;

        await client.query('UPDATE identidades SET datos_personales_primer_nombre = $1, datos_personales_segundo_nombre = $2, datos_personales_apellidos = $3 WHERE usuario_id = $4', [firstName, secondName, lastName, user.user_id]);
      } else if (name.length === 3) {
        const firstName = name[0];
        const lastName = `${name[1]} ${name[2]}`;

        await client.query('UPDATE identidades SET datos_personales_primer_nombre = $1, datos_personales_apellidos = $2 WHERE usuario_id = $3', [firstName, lastName, user.user_id]);
      }
    }

    console.log('updateNameFull executed successfully');
    client.release();
  } catch (error) {
    console.error('Error executing updateNameFull: ', error);
  }
}

module.exports = { updateNameFull };


const updateEmail = async () => {
  try {
    const result = await pool.query(
      `SELECT kyc.user_id, kyc.email, identidades.id 
      FROM kycfirewallids AS kyc
      INNER JOIN identidades ON kyc.user_id = identidades.usuario_id
      WHERE kyc.approved = true AND identidades.estado = 1`
    );

    console.log(`Actualizando ${result.rows.length} correos electrónicos en la tabla identidades...`);

    for (const user of result.rows) {
      const email = user.email;
      const identidades_id = user.id;

      await pool.query(
        `UPDATE identidades SET correo = $1 WHERE id = $2`,
        [email, identidades_id]
      );

      console.log(` - Actualizado correo en la fila de la tabla identidades con id ${identidades_id}`);
    }

    console.log('Actualización de correos electrónicos completada');
  } catch (err) {
    console.error(`Error al actualizar correos electrónicos en la tabla identidades: ${err}`);
  }
};

module.exports = { updateEmail };


const updatePhone = async () => {
  try {
    const result = await pool.query(
      `SELECT kyc.user_id, kyc.phone_number, identidades.id
       FROM kycfirewallids kyc
       JOIN identidades ON kyc.user_id = identidades.usuario_id
       WHERE kyc.approved = true AND identidades.estado = 1`
    );

    console.log(`Actualizando ${result.rows.length} telefonos en la tabla identidades...`);

    for (const row of result.rows) {
      const { user_id, phone_number, id } = row;

      console.log(`- Actualizando el telefono del usuario con user_id ${user_id}`);

      const identidades = await pool.query(
        `UPDATE identidades SET telefono = $1 WHERE id = $2 RETURNING *`,
        [phone_number, id]
      );
    }

    console.log('Telefonos actualizados correctamente en la tabla identidades');
  } catch (err) {
    console.error(`Error al actualizar telefonos en la tabla identidades: ${err}`);
  }
};

module.exports = { updatePhone };


const updateName = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM kycfirewallids WHERE approved = true`
    );

    console.log(`Actualizando usuario_nombre para ${result.rows.length} usuarios...`);

    for (const user of result.rows) {
      const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember?chat_id=${user.user_id}&user_id=${user.user_id}`);
      const json = await response.json();
      const telegramUser = json.result.user;
      const firstname = telegramUser.first_name;

      console.log(` - Actualizando usuario_nombre en la tabla identidades para el usuario con user_id ${user.user_id}: ${firstname}`);

      const identidades = await pool.query(
        `UPDATE identidades SET usuario_nombre = $1 WHERE usuario_id = $2 AND estado = 1 RETURNING *`,
        [firstname, user.user_id]
      );
    }

    console.log('Todos los usuario_nombre han sido actualizados correctamente');
  } catch (err) {
    console.error(`Error al actualizar usuario_nombre: ${err}`);
  }
};

module.exports = { updateName };


const updateAlias = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM kycfirewallids WHERE approved = true`
    );

    console.log(`Actualizando ${result.rows.length} aliases de Telegram...`);

    for (const user of result.rows) {
      const telegramUser = await getTelegramUser(user.user_id);
      const alias = telegramUser ? telegramUser.alias : null;
      
      if(alias){
        await pool.query(
          `UPDATE identidades SET usuario_usuario = $1 WHERE usuario_id = $2 AND estado = 1`,
          [alias, user.user_id]
        );
      }
    }

    console.log('Aliases de Telegram actualizados correctamente');
  } catch (err) {
    console.error(`Error al actualizar aliases de Telegram: ${err}`);
  }
};

const getTelegramUser = async (telegramId) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember?chat_id=${telegramId}&user_id=${telegramId}`);
    const json = await response.json();
    const user = json.result.user;
    return {
      firstname: user.first_name,
      alias: user.username,
    };
  } catch (error) {
    console.error(`Error al obtener el usuario de Telegram con ID ${telegramId}: ${error}`);
    return null;
  }
};

module.exports = { updateAlias };


const insertUserIdentidades = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM kycfirewallids WHERE approved = true`
    );
    console.log(`Encontrados ${result.rows.length} usuarios a insertar en la tabla identidades`);

    for (const user of result.rows) {
      const identidadesResult = await pool.query(
        `SELECT * FROM identidades WHERE usuario_id = $1`,
        [user.user_id]
      );

      if (identidadesResult.rows.length === 0) {
        console.log(`Insertando nueva fila en la tabla identidades para el usuario_id: ${user.user_id}`);
        await pool.query(
          `INSERT INTO identidades (usuario_id, estado) VALUES ($1, 1)`,
          [user.user_id]
        );
      }
    }
    console.log(`Inserción de usuarios completada`);
  } catch (err) {
    console.error(`Error al insertar usuarios en la tabla identidades: ${err}`);
  }
};

module.exports = {
  insertUserIdentidades,
};

