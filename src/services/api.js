export const sendData = async (url, metodo, params, jsonbody) => {
  try {
    const response = await fetch(`${url}${params !== null ? params : ""}`, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonbody !== null ? JSON.stringify(jsonbody) : null,
    });
    if (response.status === 200) {
      const json = await response.json();
      return json;
    }
  } catch (error) {
    alert(error);
  }
};
