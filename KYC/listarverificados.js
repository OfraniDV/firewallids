const { pool } = require('../psql/db');
const { Markup } = require('telegraf');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

const formatTable = (rows, columns) => {
  const header = columns.join(' | ');
  const separator = columns.map(() => '---').join(' | ');

  const body = rows.map((row, index) => {
    const date = moment(row.tiempo_creacion).tz('America/Havana').format('DD/MM/YYYY hh:mm A');
    return `${index + 1} | ${columns.map((col) => row[col]).join(' | ')} | ${date}`;
  });

  return `${header} | Fecha de KYC\n${separator} | ------------------------\n${body.join('\n')}`;
};

const lsverificadosCommand = async (ctx) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (usuario_id) usuario_id, usuario_usuario, usuario_nombre, tiempo_creacion FROM identidades WHERE estado = 1 ORDER BY usuario_id, tiempo_creacion ASC`
    );

    const columns = ['usuario_id', 'usuario_usuario', 'usuario_nombre'];
    const table = formatTable(result.rows, columns);

    const currentDateTime = moment.tz('America/Havana').format('DD/MM/YYYY hh:mm A');

    const header = `Estos usuarios tienen sus KYC aprobados en el sistema.\nTotal de usuarios verificados: ${result.rows.length}\nFecha y hora de generación del archivo: ${currentDateTime}\n`;

    const filename = `lista_verificados_${currentDateTime.replace(/[\W_]/g, '_')}.txt`;
    const filepath = path.join(__dirname, '..', filename);

    fs.writeFileSync(filepath, header + table);

    await ctx.replyWithDocument({ source: filepath }, { caption: `Esta es la lista de usuarios verificados generada el ${currentDateTime} en el Sistema de Reputación Plus y Firewallids.` });

    fs.unlinkSync(filepath);
  } catch (error) {
    console.error(`Error al ejecutar el comando /lsverificados: ${error}`);
    await ctx.reply('Ocurrió un error al ejecutar el comando');
  }
};

module.exports = {
  lsverificadosCommand,
};

