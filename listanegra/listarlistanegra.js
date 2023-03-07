const { pool } = require('../psql/db');
const moment = require('moment-timezone');
const path = require('path');
const { Telegraf } = require('telegraf');
const fs = require('fs');
const ExcelJS = require('exceljs');

const formatTable = (rows) => {
  const header = ['Fila', 'ID', 'Motivo', 'Fecha'].map((val) => ({ header: val, key: val.toLowerCase() }));

  const data = rows.map((row, index) => {
    return {
      fila: index + 1,
      id: row.id,
      motivo: row.motivos,
      fecha: moment.tz(row.tiempo, 'America/Havana').format('DD/MM/YYYY hh:mm A'),
    };
  });

  return { header, data };
};

const listarUsuariosEnListaNegra = async (ctx) => {
  try {
    const result = await pool.query(`SELECT id, motivos, tiempo FROM listanegra ORDER BY tiempo ASC`);
    const countResult = await pool.query(`SELECT COUNT(*) FROM listanegra`);
    const totalUsuariosEnListaNegra = countResult.rows[0].count;

    const currentDateTime = moment.tz('America/Havana').format('DD/MM/YYYY hh:mm A');
    const filename = `lista_negra_${currentDateTime.replace(/[\W_]/g, '_')}.xlsx`;
    const filepath = path.join(__dirname, '..', filename);

    const table = formatTable(result.rows);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lista Negra');
    worksheet.columns = table.header;
    worksheet.addRows(table.data);

    await workbook.xlsx.writeFile(filepath);

    const bot = new Telegraf(process.env.BOT_TOKEN);
    const caption = `Esta es la lista de usuarios en lista negra generada el ${currentDateTime} en el Sistema de Reputación Plus y Firewallids. Total de usuarios en lista negra: ${totalUsuariosEnListaNegra}`;
    await ctx.replyWithDocument({ source: filepath }, { caption });

    fs.unlinkSync(filepath);
  } catch (error) {
    console.error(`Error al ejecutar el comando /listanegra: ${error}`);
    await ctx.reply('Ocurrió un error al ejecutar el comando');
  }
};

module.exports = {
  listarUsuariosEnListaNegra,
};

