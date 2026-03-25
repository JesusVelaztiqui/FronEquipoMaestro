import { addToast } from "../components/Tooltip";

export const imprimirPdf = async (objeto, url, loader, ocultarLoader) => {
  loader();
  try {
    const userJson = localStorage.getItem("usuarioMaestro");
    const userData = userJson ? JSON.parse(userJson) : "";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.token || ""}`,
      },
      body: JSON.stringify(objeto),
    });
    ocultarLoader();
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data;
    } else if (contentType && contentType.includes("application/pdf")) {
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      const pdfEl = document.getElementById("pdf");
      if (document.getElementById("newWindows")?.checked) {
        window.open(pdfUrl);
      } else if (pdfEl) {
        pdfEl.src = pdfUrl;
      } else {
        window.open(pdfUrl);
      }
      return pdfUrl;
    } else {
      throw new Error("Tipo de respuesta inesperado: " + contentType);
    }
  } catch (error) {
    ocultarLoader();
    addToast({
      type: "error",
      title: "Error",
      message: error?.message || String(error),
      duration: 3000,
    });
  }
};

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
