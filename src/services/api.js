import { addToast } from "../components/Tooltip";

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
      throw {
        status: 403,
        procesado: new Date().toISOString().split("T")[0],
        mensaje: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
        url: url,
        linea: 0,
      };
    }
    const json = await response.json();
    return json;
  } catch (error) {
    addToast({
      type: "error",
      title: "Error",
      message: error,
      duration: 3000,
    });
  }
};
