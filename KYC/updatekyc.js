require('dotenv').config();
const { pool } = require('../psql/db');
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');

const bot = new Telegraf(process.env.BOT_TOKEN);

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

async function updateKyc(user) {
  try {
    const user_id = user.user_id;
    const approved = user.approved;

    console.log(`Actualizando KYC para el usuario con user_id ${user_id}...`);

    if (approved) {
      const result = await pool.query(
        `SELECT * FROM identidades WHERE usuario_id = $1`,
        [user_id]
      );

      // Si no se encontró un resultado, insertar una nueva fila en la tabla identidades
      if (result.rows.length === 0) {
        console.log(` - Insertando una nueva fila en la tabla identidades`);

        // Insertar una nueva fila en la tabla identidades
        const identidades = await pool.query(
          `INSERT INTO identidades (usuario_id, estado) VALUES ($1, 1) RETURNING *`,
          [user_id]
        );
      }

      // Tomar el valor de @alias del usuario en telegram y actualizar la columna usuario_usuario en la tabla identidades
      const alias = await getTelegramUser(user_id).then(res => res.alias);
      console.log(` - Actualizando usuario_usuario en la tabla identidades: ${alias}`);

      const identidades1 = await pool.query(
        `UPDATE identidades SET usuario_usuario = $1 WHERE usuario_id = $2 AND estado = 1 RETURNING *`,
        [alias, user_id]
      );

      // Tomar el valor de firstname del usuario en telegram y actualizar la columna usuario_nombre en la tabla identidades
      const telegramUser = await getTelegramUser(user_id);
      const firstname = telegramUser ? telegramUser.firstname : null;
      console.log(` - Actualizando usuario_nombre en la tabla identidades: ${firstname}`);

      const identidades2 = await pool.query(
        `UPDATE identidades SET usuario_nombre = $1 WHERE usuario_id = $2 AND estado = 1 RETURNING *`,
        [firstname, user_id]
      );





      // Actualizar la columna telefono en la tabla identidades
      const phone_number = user.phone_number;
      console.log(` - Actualizando telefono en la tabla identidades: ${phone_number}`);

      const identidades3 = await pool.query(
        `UPDATE identidades SET telefono = $1 WHERE usuario_id = $2 RETURNING *`,
        [phone_number, user_id]
      );

      // Actualizar la columna correo en la tabla identidades
      const email = user.email;
      console.log(` - Actualizando correo en la tabla identidades: ${email}`);

      const identidades4 = await pool.query(
        `UPDATE identidades SET correo = $1 WHERE usuario_id = $2 RETURNING *`,
        [email, user_id]
      );

      // Actualizar los valores correspondientes en la tabla identidades para el nombre completo del usuario
      const name = user.name;
      let primerNombre = '';
      let segundoNombre = '';
      let apellidos = '';

      const palabras = name.split(' ');

      if (palabras.length === 4) {
        primerNombre = palabras[0];
        segundoNombre = palabras[1];
        apellidos = palabras[2] + ' ' + palabras[3];
      } else if (palabras.length === 3) {
        primerNombre = palabras[0];
        apellidos = palabras[1] + ' ' + palabras[2];
      }

      console.log(` - Actualizando datos_personales_primer_nombre: ${primerNombre}`);
      console.log(` - Actualizando datos_personales_segundo_nombre: ${segundoNombre}`);
      console.log(` - Actualizando datos_personales_apellidos: ${apellidos}`);

      const identidades5 = await pool.query(
        `UPDATE identidades SET datos_personales_primer_nombre = $1, datos_personales_segundo_nombre = $2, datos_personales_apellidos = $3 WHERE usuario_id = $4 RETURNING *`,
        [primerNombre, segundoNombre, apellidos, user_id]
      );

      // Actualizar la columna direccion_localidad en la tabla identidades
      const municipality = user.municipality;
      console.log(` - Actualizando direccion_localidad en la tabla identidades: ${municipality}`);

      const identidades6 = await pool.query(
        `UPDATE identidades SET direccion_localidad = $1 WHERE usuario_id = $2 RETURNING *`,
        [municipality, user_id]
      );

      // Actualizar la columna direccion_region en la tabla identidades y la columna direccion_codigo_pais en la tabla identidades con un valor de "CU"
      const province = user.province;
      console.log(` - Actualizando direccion_region en la tabla identidades: ${province}`);

      const identidades7 = await pool.query(
        `UPDATE identidades SET direccion_region = $1, direccion_codigo_pais = 'CU' WHERE usuario_id = $2 RETURNING *`,
        [province, user_id]
      );

      // Actualizar la columna documento_identidad_numero en la tabla identidades
      const identity_number = user.identity_number;
      console.log(` - Actualizando documento_identidad_numero en la tabla identidades: ${identity_number}`);

      const identidades8 = await pool.query(
        `UPDATE identidades SET documento_identidad_numero = $1 WHERE usuario_id = $2 RETURNING *`,
        [identity_number, user_id]
      );

      console.log(`KYC actualizado correctamente para el usuario con user_id ${user_id}`);
      console.log('');
    }
  } catch (err) {
    console.error(`Error al actualizar KYC para el usuario con user_id ${user.user_id}: ${err}`);
  }
}

// Función para actualizar KYC para todos los usuarios en la tabla kycfirewallids
const updateAllKyc = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM kycfirewallids`
    );

    console.log(`Actualizando KYC para ${result.rows.length} usuarios...`);

    for (const user of result.rows) {
      await updateKyc(user);
    }

    console.log('Todos los KYC han sido actualizados correctamente');
  } catch (err) {
    console.error(`Error al obtener los usuarios de KYC: ${err}`);
  }
};

updateAllKyc();