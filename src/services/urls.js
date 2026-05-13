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

export const listarCaja               = `${baseurl}caja/listar`;
export const detalleCaja              = `${baseurl}caja/detalle`;
export const insumosHistorialCaja     = `${baseurl}caja/insumos-historial`;
export const laboratorioHistorialCaja = `${baseurl}caja/laboratorio-historial`;
export const resumenPeriodoCaja       = `${baseurl}caja/resumen-periodo`;
export const cajaSoloMeses            = `${baseurl}caja/solo-meses`;
export const cajaDetalleSolo          = `${baseurl}caja/detalle-solo`;
export const cajaCompartidoMeses      = `${baseurl}caja/compartido-meses`;
export const cajaDetalleCompartido    = `${baseurl}caja/detalle-compartido`;
export const cajaAdminResumen    = `${baseurl}caja/admin-resumen`;
export const cajaAdminDetalle    = `${baseurl}caja/admin-detalle`;
export const cajaAdminLabDetalle = `${baseurl}caja/admin-lab-detalle`;

export const generarRecetario = `${baseurl}report/recetario`;
export const generarHistorial = `${baseurl}report/historial`;
export const generarConsentimiento = `${baseurl}report/consentimiento`;
export const generarPresupuesto    = `${baseurl}report/presupuesto`;

export const listarTratamiento           = `${baseurl}tratamiento/listar`;
export const listarTratamientoPorPaciente = `${baseurl}tratamiento/listarPorPaciente`;
export const grabarTratamiento           = `${baseurl}tratamiento/grabar`;
export const editarTratamiento           = `${baseurl}tratamiento/editar`;
export const eliminarTratamiento         = `${baseurl}tratamiento/eliminar`;

export const listarProductos = `${baseurl}productos/listar`;
export const grabarProductos = `${baseurl}productos/grabar`;
export const editarProductos = `${baseurl}productos/modificar`;
export const eliminarProductos = `${baseurl}productos/eliminar`;
export const modificarUsuario = `${baseurl}usuario/modificar`;
export const listarDashboardDoctor = `${baseurl}dahsboard/listarIngEgr`;
