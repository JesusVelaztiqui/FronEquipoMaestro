export const sendData = async (url, metodo, params, jsonbody) => {
  try {
    const userJson = localStorage.getItem("usuarioMaestro");
    const userData = userJson ? JSON.parse(userJson) : "";

    const response = await fetch(`${url}${params !== null ? params : ""}`, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.token || ""}`,
      },
      body: jsonbody !== null ? JSON.stringify(jsonbody) : null,
    });

    if (response.status === 403) {
      const errorModel = {
        status: 403,
        procesado: new Date().toISOString().split("T")[0],
        mensaje: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
        url: url,
        linea: 0,
      };
      const error = new Error(errorModel.mensaje);
      error.status = 403;
      error.data = errorModel;
      throw error;
    }
    const json = await response.json();
    if (response.ok) {
      return json;
    }
    const error = new Error(json.mensaje || "Error en el servidor");
    error.status = json.status;
    error.data = json;
    throw error;
  } catch (error) {
    if (error.data) {
      throw error;
    }
    throw {
      status: 0,
      procesado: new Date().toISOString().split("T")[0],
      mensaje: "Error de conexión con el servidor",
      url: url,
      linea: 0,
    };
  }
};
