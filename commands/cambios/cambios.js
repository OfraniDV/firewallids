const { pool } = require('../../psql/db');

function generarReporte(rows, tipoReporte) {
  let reporte = "";
  let prevTime = null;
  let cambios = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const tiempo = new Date(row.tiempo).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });

    // Si la fila actual tiene el mismo tiempo que la anterior, no se agrega al reporte
    if (tiempo === prevTime) {
      continue;
    }

    // Si la fila actual tiene la misma hora, minuto y segundo que la anterior, se omite
    if (tiempo.slice(0, 14) === prevTime?.slice(0, 14)) {
      continue;
    }

    prevTime = tiempo;
    reporte += `${tiempo.padEnd(20)} ${row[tipoReporte].padEnd(30)}\n`;
    cambios++;
  }

  reporte += `\nEste ID ha tenido un total de ${cambios} cambios de ${tipoReporte}.`;

  if (cambios > 1) {
    reporte += " 🤔👀";
  }

  reporte += "\n";
  return reporte;
}

async function obtenerCambiosUsuario(id) {
  const queryUsuario = `
    SELECT * FROM monitorizacion_usuarios WHERE id = $1 ORDER BY tiempo ASC;
  `;
  const { rows: usuarioRows } = await pool.query(queryUsuario, [id]);

  const queryNombre = `
    SELECT * FROM monitorizacion_nombres WHERE id = $1 ORDER BY tiempo ASC;
  `;
  const { rows: nombreRows } = await pool.query(queryNombre, [id]);

  if (usuarioRows.length === 0 && nombreRows.length === 0) {
    return `Aún no he visto los cambios de ID ${id}. 😔`;
  }

  let reporte = "";
  if (usuarioRows.length > 0) {
    reporte += `👤 Estos son los cambios de usuarios del ID ${id}:\n`;
    reporte += "Fecha".padEnd(20) + "Usuario".padEnd(30) + "\n";
    reporte += "===============================\n";
    reporte += generarReporte(usuarioRows, "usuario");
  }
  if (nombreRows.length > 0) {
    reporte += `\n\n📝 Estos son los cambios de nombres del ID ${id}:\n`;
    reporte += "Fecha".padEnd(20) + "Nombre".padEnd(30) + "\n";
    reporte += "===============================\n";
    reporte += generarReporte(nombreRows, "nombres");
  }

  return reporte;
}

module.exports = {
  obtenerCambiosUsuario
};
