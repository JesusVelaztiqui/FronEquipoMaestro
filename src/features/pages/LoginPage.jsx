import { useEffect, useState } from "react";
import { addToast } from "../../components/Tooltip";
import { sendData } from "../../services/api";
import { iniciarSesion } from "../../services/urls";
import { useNavigate } from "react-router-dom";
import useUserStore from "../auth/zustandUser";
import { NoEmpty } from "../../components/NoEmpty";

const LoginPage = () => {
  const navigate = useNavigate();
  const [usuario, setusuario] = useState({ email: "", pass: "" });
  const { setUser, clearUser } = useUserStore();
  const { validate, clearErrors } = NoEmpty();
  const handleUser = (event) => {
    setusuario({ ...usuario, [event.target.name]: event.target.value });
  };

  const fetchLogin = async () => {
    try {
      const response = await sendData(iniciarSesion, "POST", null, usuario);
      if (response.status === 200) {
        setUser(response.data);
        navigate("/inicio");
        addToast({
          type: "success",
          title: "Bienvenido",
          message: response?.data?.nombre + " " + response?.data?.apellido,
          duration: 3000,
        });
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: response?.mensaje,
          duration: 3000,
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: error,
        duration: 3000,
      });
    }
  };

  const handleLogin = () => {
    clearErrors();
    if (!validate()) return;

    fetchLogin();
  };

  useEffect(() => {
    clearUser();
  }, []);

  return (
    <>
      <div className="login-page">
        <div className="login-container">
          <div className="login-form-section">
            <div className="form-wrapper">
              <h1 className="welcome-title">BIENVENIDOS 👋</h1>
              <p className="subtitle">Sistema de Odontología </p>
              <div className={`login-form login-mode `}>
                <div className="form-fields login-fields">
                  <div className="input-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="form-input"
                      onChange={handleUser}
                      noempty="true"
                      validar="Ingrese el Correo Electrónico"
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="password"
                      name="pass"
                      placeholder="Contraseña"
                      className="form-input"
                      onChange={handleUser}
                      noempty="true"
                      validar="Ingrese la contraseña"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => handleLogin()}
                >
                  Ingresar
                </button>
              </div>
            </div>
          </div>

          <div className="image-section">
            <img
              src="/portadaEM.png"
              alt="Mountain landscape"
              className="background-image"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
