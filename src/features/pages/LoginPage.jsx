import { useState } from "react";
import { addToast } from "../../components/Tooltip";
import { sendData } from "../../services/api";
import { iniciarSesion, resgitrarmePrueba } from "../../services/urls";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const key = "1234567890123456";
  const iv = "abcdef1234567890";
  const navigate = useNavigate();
  function encriptar(valor) {
    if (!valor) return "";

    const encrypted = CryptoJS.AES.encrypt(
      valor,
      CryptoJS.enc.Utf8.parse(key),
      {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    ).toString();

    return encrypted;
  }
  const [usuario, setUsuario] = useState({
    email: "",
    pass: "",
  });
  const [modeAccounts, SetModeAccounts] = useState(true);

  const [registerUser, setRegisterUser] = useState({
    licruc: "",
    lictel: "",
    id: "",
    licport: "",
    licnombre: "",
    licapellido: "",
    licdireccion: "",
    licemail: "",
    licpassword: "",
    licmotivofechafin: "",
    licip: "",
    licpasdatabase: "",
    licestado: "",
    prueba: "",
    licfechaingreso: new Date().toISOString().split("T")[0],
    licfechafin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const handleChangelogin = (event) => {
    const { name, value } = event.target;
    setUsuario({ ...usuario, [name]: encriptar(value.trim()) });
  };
  const handleChangeRegistrar = (event) => {
    const { name, value } = event.target;
    setRegisterUser({ ...registerUser, [name]: encriptar(value.trim()) });
  };

  const acceder = async () => {
    try {
      const response = await sendData(iniciarSesion, "POST", null, usuario);
      if (response.status === 200) {
        navigate("/home");
        addToast({
          type: "success",
          title: "Inicio de Sesión",
          message: `Bienvenido ${response?.data?.licnombre}`,
          duration: 3000,
        });
      } else if (response.status === 404) {
        addToast({
          type: "error",
          title: "Atención",
          message: response?.mensaje,
          duration: 5000,
        });
      } else {
        addToast({
          type: "error",
          title: "Parece que aún no tienes cuenta",
          message: response?.data?.mensaje,
          duration: 5000,
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: error.message,
        duration: 3000,
      });
    }
  };

  const registrarme = async () => {
    try {
      console.log(registerUser);
      const response = await sendData(
        resgitrarmePrueba,
        "POST",
        null,
        registerUser
      );
      console.log(response);
      if (response.status === 200) {
        addToast({
          type: "success",
          title: "Registro Éxitoso",
          message: response?.data?.licnombre,
          duration: 3000,
        });
      } else {
        addToast({
          type: "error",
          title: "Atención",
          message: response?.mensaje,
          duration: 3000,
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: error.message,
        duration: 3000,
      });
    }

    console.log(registerUser);
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <div className="header">
          <h2>TENER UN SISTEMA YA NO ES IMPOSIBLE</h2>
          <div className="auth-buttons">
            <button
              className="sign-up-btn"
              onClick={() => {
                SetModeAccounts(false);
              }}
            >
              Crear Cuenta
            </button>
            <button
              className="join-us-btn"
              onClick={() => {
                SetModeAccounts(true);
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>

        <div className="artwork-container">
          <div className="artwork-card">
            <div className="artwork-image"></div>
          </div>

          <div className="artist-section">
            <div className="artist-info">
              <div className="avatar">
                <img
                  src="data:image/svg+xml,%3csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='40' height='40' fill='%234a90e2'/%3e%3c/svg%3e"
                  alt="Andrew"
                />
              </div>
              <div className="artist-details">
                <h3>Andrew.ui</h3>
                <p>UI & Illustration</p>
              </div>
            </div>

            <div className="navigation-buttons">
              <button className="nav-btn">‹</button>
              <button className="nav-btn">›</button>
            </div>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="login-header">
          <div className="logo">FACTURA YA</div>
          <div className="language-selector">
            <span>15 DÍAS GRATIS</span>
          </div>
        </div>

        <div className="login-form-container">
          {modeAccounts ? (
            <div className="login-form">
              <h1>Hola Facturador</h1>
              <p className="welcome-text">
                Bienvenido a tu Sistema de Facturación
              </p>
              <div className="form-fields">
                <>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChangelogin}
                    className="form-input"
                  />
                  <input
                    type="password"
                    name="pass"
                    placeholder="Password"
                    onChange={handleChangelogin}
                    className="form-input"
                  />
                  <div className="forgot-password">
                    <a href="#">Olvidaste tu contraseña ?</a>
                  </div>
                  <div className="divider">
                    <span>or</span>
                  </div>
                  <button className="google-btn">
                    <span>Comprar Licencia</span>
                    <i className="far fa-credit-card"></i>
                  </button>
                  <button className="login-btn" onClick={() => acceder()}>
                    Ingresar
                  </button>
                </>
              </div>
              <p className="signup-text">
                Siguenos en nuestras redes sociales{" "}
                <a href="#">estaras al día</a>
              </p>

              <div className="social-icons">
                <a href="#" className="social-icon">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="social-icon">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="social-icon">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="social-icon">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.402.402-.402.402l-.402-.402c-1.162-.402-1.879-1.402-1.879-2.402 0-3.402 2.402-6.802 6.802-6.802 3.601 0 6.402 2.569 6.402 6.002 0 3.579-2.258 6.457-5.387 6.457-1.052 0-2.042-.547-2.381-1.207 0 0-.521 1.98-.647 2.465-.234.897-.867 2.022-1.294 2.707.975.301 2.006.465 3.076.465 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            <div className="register-form">
              <h1>Registrate Ya!</h1>
              <p className="welcome-text">
                Crea una cuenta para poder iniciar sesión
              </p>
              <div className="form-fields">
                <div className="columns">
                  <input
                    type="text"
                    name="licnombre"
                    placeholder="Nombre"
                    onChange={handleChangeRegistrar}
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="licapellido"
                    placeholder="Apellido"
                    className="form-input"
                  />
                </div>
                <div className="columns">
                  <input
                    type="text"
                    name="licruc"
                    placeholder="Ruc / C.I"
                    onChange={handleChangeRegistrar}
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="licdireccion"
                    placeholder="Dirección"
                    className="form-input"
                    onChange={handleChangeRegistrar}
                  />
                </div>
                <div className="columns">
                  <input
                    type="text"
                    name="lictel"
                    placeholder="Celular"
                    className="form-input"
                    onChange={handleChangeRegistrar}
                  />
                  <input
                    type="email"
                    name="licemail"
                    placeholder="Email"
                    className="form-input"
                    onChange={handleChangeRegistrar}
                  />
                </div>
                <div className="columns">
                  <input
                    type="password"
                    name="licpassword"
                    placeholder="Contraseña"
                    className="form-input"
                    onChange={handleChangeRegistrar}
                  />

                  <input
                    type="password"
                    name="licpassword"
                    placeholder="Confirmar Contraseña"
                    className="form-input"
                  />
                </div>

                <div className="divider">
                  <span></span>
                </div>
                <button className="login-btn" onClick={() => registrarme()}>
                  Registrarme
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
