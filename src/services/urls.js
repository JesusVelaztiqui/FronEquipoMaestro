const baseurl = import.meta.env.VITE_BASEURL;

export const iniciarSesion = `${baseurl}usuario/validar`;
export const dahsboardAdmin = `${baseurl}dahsboard/listar`;
export const listarDoctores = `${baseurl}doctores/listar`;
export const eliminarDoctores = `${baseurl}doctores/eliminar`;
export const grabarDoctores = `${baseurl}doctores/grabar`;
export const editarDoctores = `${baseurl}doctores/editar`;
export const listarPacientes = `${baseurl}pacientes/listar`;
export const eliminarPacientes = `${baseurl}pacientes/eliminar`;
export const grabarPacientes = `${baseurl}pacientes/grabar`;
export const editarPacientes = `${baseurl}pacientes/editar`;
export const listarTurnos = `${baseurl}turnos/listar`;
export const listarAuditoria = `${baseurl}auditoria/listar`;
