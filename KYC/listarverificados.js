const { pool } = require('../psql/db');
const { Markup } = require('telegraf');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

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
    const verificados = await pool.query(
      `SELECT DISTINCT ON (usuario_id) usuario_id, usuario_usuario, usuario_nombre, tiempo_creacion FROM identidades WHERE estado = 1 ORDER BY usuario_id, tiempo_creacion ASC`
    );
    const listanegra = await pool.query(`SELECT id FROM listanegra`);

    const columns = ['usuario_id', 'usuario_usuario', 'usuario_nombre'];
    const rows = verificados.rows.filter((row) => !listanegra.rows.some((item) => item.id === row.usuario_id));
    const table = formatTable(rows, columns);

    const currentDateTime = moment.tz('America/Havana').format('DD/MM/YYYY hh:mm A');

    const header = `Estos usuarios tienen sus KYC aprobados en el sistema.\nTotal de usuarios verificados: ${rows.length}\nFecha y hora de generación del archivo: ${currentDateTime}\n`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lista de usuarios verificados');

    worksheet.columns = [
      { header: 'ID', key: 'usuario_id', width: 10 },
      { header: 'Usuario', key: 'usuario_usuario', width: 20 },
      { header: 'Nombre', key: 'usuario_nombre', width: 30 },
      { header: 'Fecha de KYC', key: 'tiempo_creacion', width: 20 }
    ];

    rows.forEach((row) => {
      worksheet.addRow(row);
    });

    const filename = `lista_verificados_${currentDateTime.replace(/[\W_]/g, '_')}.xlsx`;
    const filepath = path.join(__dirname, '..', filename);

    await workbook.xlsx.writeFile(filepath);

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

