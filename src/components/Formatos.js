export function formatoFecha(valor, format) {
  if (format === "dd/MM/yyyy") {
    let dia = valor.substring(8, 10);
    let mes = valor.substring(5, 7);
    let ano = valor.substring(0, 4);
    return `${dia}/${mes}/${ano}`;
  } else {
    let dia = valor.substring(0, 2);
    let mes = valor.substring(3, 5);
    let ano = valor.substring(6, 10);
    return `${ano}-${mes}-${dia}`;
  }
}

export function formatearFechaHora(isoString) {
  const fecha = new Date(isoString);

  const MM = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  const YYYY = fecha.getFullYear();

  const HH = String(fecha.getHours()).padStart(2, "0");
  const mm = String(fecha.getMinutes()).padStart(2, "0");
  const ss = String(fecha.getSeconds()).padStart(2, "0");

  return {
    fecha: `${dd}/${MM}/${YYYY}`,
    hora: `${HH}:${mm}:${ss}`,
  };
}

export function calcRows(element, row) {
  if (!element || !row) return 0;

  const alto1 = element.clientHeight;
  const altoRow = row.clientHeight;
  return Math.round(alto1 / altoRow) - 1;
}
