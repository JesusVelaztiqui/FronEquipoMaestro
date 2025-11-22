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
