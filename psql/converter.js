const { pool } = require('./db');

async function convertIntegerToBigIntNombres() {
  const query = {
    text: 'ALTER TABLE monitorizacion_nombres ALTER COLUMN id TYPE BIGINT USING id::BIGINT'
  };

  try {
    await pool.query(query);
    console.log('La columna id ha sido convertida a tipo BIGINT en la tabla monitorizacion_nombres.');
  } catch (error) {
    console.error(`Error al convertir la columna id a tipo BIGINT en la tabla monitorizacion_nombres: ${error}`);
  }
}

async function convertIntegerValuesToBigIntNombres() {
  const query = {
    text: 'SELECT * FROM monitorizacion_nombres WHERE id::BIGINT <> id'
  };

  try {
    const result = await pool.query(query);
    const rows = result.rows;
    const numRecords = rows.length;

    for (let i = 0; i < numRecords; i++) {
      const row = rows[i];
      const id = parseInt(row.id);
      const updateQuery = {
        text: 'UPDATE monitorizacion_nombres SET id = $1 WHERE id = $2',
        values: [id, row.id]
      };
      await pool.query(updateQuery);
    }

    console.log(`Se han convertido ${numRecords} valores de la columna id de tipo INTEGER a BIGINT en la tabla monitorizacion_nombres.`);
  } catch (error) {
    console.error(`Error al convertir los valores de la columna id de tipo INTEGER a BIGINT en la tabla monitorizacion_nombres: ${error}`);
  }
}

async function convertIntegerToBigIntUsuarios() {
  const query = {
    text: 'ALTER TABLE monitorizacion_usuarios ALTER COLUMN id TYPE BIGINT USING id::BIGINT'
  };

  try {
    await pool.query(query);
    console.log('La columna id ha sido convertida a tipo BIGINT en la tabla monitorizacion_usuarios.');
  } catch (error) {
    console.error(`Error al convertir la columna id a tipo BIGINT en la tabla monitorizacion_usuarios: ${error}`);
  }
}

async function convertIntegerValuesToBigIntUsuarios() {
  const query = {
    text: 'SELECT * FROM monitorizacion_usuarios WHERE id::BIGINT <> id'
  };

  try {
    const result = await pool.query(query);
    const rows = result.rows;
    const numRecords = rows.length;

    for (let i = 0; i < numRecords; i++) {
      const row = rows[i];
      const id = parseInt(row.id);
      const updateQuery = {
        text: 'UPDATE monitorizacion_usuarios SET id = $1 WHERE id = $2',
        values: [id, row.id]
      };
      await pool.query(updateQuery);
    }

    console.log(`Se han convertido ${numRecords} valores de la columna id de tipo INTEGER a BIGINT en la tabla monitorizacion_usuarios.`);
  } catch (error) {
    console.error(`Error al convertir los valores de la columna id de tipo INTEGER a BIGINT en la tabla monitorizacion_usuarios: ${error}`);
  }
}

convertIntegerToBigIntNombres();
convertIntegerValuesToBigIntNombres();
convertIntegerToBigIntUsuarios();
convertIntegerValuesToBigIntUsuarios();
