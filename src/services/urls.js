const baseurl = import.meta.env.VITE_BASEURL;

export const iniciarSesion = `${baseurl}usuario/validar`;
export const listarDoctores = `${baseurl}doctores/listar`;
export const eliminarDoctores = `${baseurl}doctores/eliminar`;
export const grabarDoctores = `${baseurl}doctores/grabar`;
export const editarDoctores = `${baseurl}doctores/editar`;
export const listarAuditoria = `${baseurl}auditoria/listar`;
