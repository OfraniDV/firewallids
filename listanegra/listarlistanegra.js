const { pool } = require('../psql/db');
const moment = require('moment-timezone');
const excel = require('exceljs');

const formatTable = (rows) => {
  const header = ['Fila', 'ID', 'Motivo', 'Tiempo'].map((value) => ({ name: value }));

  const body = rows.map((row, index) => {
    return { fila: index + 1, id: row.id, motivo: row.motivos, tiempo: row.tiempo };
  });

  return [header, ...body];
};

const listarUsuariosEnListaNegra = async (ctx) => {
  try {
    const result = await pool.query(
      `SELECT id, motivos, tiempo FROM listanegra ORDER BY tiempo ASC`
    );

    const workbook = new excel.Workbook();
    const sheet = workbook.addWorksheet('Usuarios en lista negra');

    const headerRow = sheet.addRow([
      'Estos usuarios se encuentran en la lista negra del sistema.',
      `Total de usuarios en lista negra: ${result.rows.length}`,
    ]);
    headerRow.font = { bold: true };
    sheet.addRow([]);

    const currentDateTime = moment.tz('America/Havana').format('DD/MM/YYYY hh:mm A');
    const subtitleRow = sheet.addRow([`Fecha y hora de generación del archivo: ${currentDateTime}`]);
    subtitleRow.font = { italic: true };
    sheet.addRow([]);

    const table = formatTable(result.rows);
    table.forEach((row) => {
      sheet.addRow(row);
    });

    sheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });

    const filename = `lista_negra_${currentDateTime.replace(/[\W_]/g, '_')}.xlsx`;

    await workbook.xlsx.writeFile(filename);

    const file = await fs.promises.readFile(filename);

    await ctx.replyWithDocument({ filename, source: file }, { caption: `Estos son los usuarios que se encuentran en lista negra en el Sistema de Reputación Plus y Firewallids.` });

    await fs.promises.unlink(filename);
  } catch (error) {
    console.error(`Error al ejecutar el comando /listanegra: ${error}`);
    await ctx.reply('Ocurrió un error al ejecutar el comando');
  }
};

module.exports = {
  listarUsuariosEnListaNegra,
};
