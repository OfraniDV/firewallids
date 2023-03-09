const { pool } = require('../psql/db');

async function crearTabla() {
  const client = await pool.connect();
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS reportes (
      id SERIAL PRIMARY KEY,
      ticket INTEGER NOT NULL UNIQUE,
      user_id BIGINT NOT NULL,
      reporte TEXT NOT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      resolver BOOLEAN DEFAULT false,
      id_admin_resolvio BIGINT DEFAULT NULL,
      solucion TEXT DEFAULT NULL,
      mensaje_link TEXT DEFAULT NULL
    );
    
    CREATE SEQUENCE IF NOT EXISTS reportes_ticket_seq;
    ALTER TABLE reportes ALTER COLUMN ticket SET DEFAULT nextval('reportes_ticket_seq');
  `);
    console.log('Tabla de reportes creada exitosamente!');
  } finally {
    client.release();
  }
}

async function actualizarMensajeLink(ticket, mensajeLink) {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE reportes SET mensaje_link = $2 WHERE ticket = $1;
    `, [ticket, mensajeLink]);
    console.log(`Enlace al mensaje reportado actualizado para el ticket ${ticket}`);
  } finally {
    client.release();
  }
}

module.exports = { crearTabla, actualizarMensajeLink };

