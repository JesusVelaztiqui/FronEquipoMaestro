const baseurl = import.meta.env.VITE_BASEURL;

export const iniciarSesion = `${baseurl}usuario/validar`;
export const dahsboardAdmin = `${baseurl}dahsboard/listar`;
export const listarDoctores = `${baseurl}doctores/listar`;
export const eliminarDoctores = `${baseurl}doctores/eliminar`;
export const grabarDoctores = `${baseurl}doctores/grabar`;
export const editarDoctores = `${baseurl}doctores/editar`;
export const listarPacientes = `${baseurl}pacientes/listar`;
export const eliminarPacientes = `${baseurl}pacientes/eliminar`;
export const listarImagenes = `${baseurl}pacientes/listarimagenes/base64`;
export const grabarPacientes = `${baseurl}pacientes/grabar`;
export const editarPacientes = `${baseurl}pacientes/editar`;
export const listarTurnos = `${baseurl}turnos/listar`;
export const grabarTurnos = `${baseurl}turnos/grabar`;
export const editarTurnos = `${baseurl}turnos/editar`;
export const eliminarTurnos = `${baseurl}turnos/eliminar`;
export const recuperarTurno = `${baseurl}turnos/recuperar`;
export const listarImagenesTurno = `${baseurl}turnos/imagenes`;
export const eliminarImagenTurno = `${baseurl}turnos/imagenes`;

export const listarAuditoria = `${baseurl}auditoria/listar`;

export const listarCaja = `${baseurl}caja/listar`;
export const grabarCaja = `${baseurl}caja/grabar`;
export const editarCaja = `${baseurl}caja/editar`;
export const eliminarCaja = `${baseurl}caja/eliminar`;

export const generarRecetario = `${baseurl}report/recetario`;
export const generarHistorial = `${baseurl}report/historial`;
export const generarConsentimiento = `${baseurl}report/consentimiento`;
export const generarPresupuesto    = `${baseurl}report/presupuesto`;

export const listarProductos = `${baseurl}productos/listar`;
export const grabarProductos = `${baseurl}productos/grabar`;
export const editarProductos = `${baseurl}productos/modificar`;
export const eliminarProductos = `${baseurl}productos/eliminar`;
export const recuperarProductos = `${baseurl}productos/recuperar`;
export const modificarUsuario = `${baseurl}usuario/modificar`;
export const listarDashboardDoctor = `${baseurl}dahsboard/listarIngEgr`;
export const listarTurnosDoctor = `${baseurl}dahsboard/listarTurnosDoctor`;
