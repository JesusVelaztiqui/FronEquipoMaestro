import { useState } from "react";
import { addToast } from "../../components/Tooltip";
import { sendData } from "../../services/api";
import { iniciarSesion, resgitrarmePrueba } from "../../services/urls";
import { useNavigate } from "react-router-dom";
import Planes from "../Components/Planes";
import useUserStore from "../auth/zustandUser";
import Payment from "../../components/Payment";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    licnivel: "",
    licpasdatabase: "",
    licestado: "",
    prueba: "",
    licfechaingreso: new Date().toISOString().split("T")[0],
    licfechafin: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split("T")[0],
  });
  const [usuario, setUsuario] = useState({
    email: "",
    pass: "",
  });
  const { setUser } = useUserStore();
  const [detallePlan, setDetallePlan] = useState({
    licfechafin: "",
    licfechaingreso: "",
    tipoLicencia: "",
    tituloInfomacion: "",
    iformacion: "",
    precioLicencia: "",
    precioCajas: "",
  });

  // const [pagos, setPagos] = useState(false);
  const [isOpenPayment, setIsOpenPayment] = useState(false);

  const handleChangelogin = (event) => {
    const { name, value } = event.target;
    setUsuario({ ...usuario, [name]: value.trim() });
  };

  const handleChangeRegistrar = (event) => {
    const { name, value } = event.target;
    setRegisterUser({ ...registerUser, [name]: value.trim() });
  };

  const validarRegistrarmePrueba = async () => {
    const datosPrueba = {
      ...registerUser,
      licport: 5432,
      licnivel: "admin",
      licpasdatabase: "123",
      prueba: true,
      licip: "localhost",
    };

    await registrarme(datosPrueba);
    setUsuario({
      ...usuario,
      email: datosPrueba?.licemail,
      pass: datosPrueba?.licpassword,
    });
    setRegisterUser(datosPrueba);
    setIsModalOpen(false);
    setIsLogin(true);
  };

  const crearCuentaEmprendedorMes = async () => {
    const fechaVencimiento = new Date(
      new Date().setMonth(new Date().getMonth() + 1)
    )
      .toISOString()
      .split("T")[0];
    setDetallePlan({
      ...detallePlan,
      licfechaingreso: new Date().toISOString().split("T")[0],
      licfechafin: fechaVencimiento,
      tituloInfomacion: "REGLAMENTO",
      tipoLicencia: "EMPRENDEDOR",
      precioLicencia: "₲ 100.000",
      precioCajas: "₲ 0",
      iformacion:
        "El usuario es responsable de utilizar el sistema de facturación de manera legal y ética. Queda prohibido emplearlo para fraudes, estafas o cualquier irregularidad; el incumplimiento resultará en la suspensión inmediata de la licencia.",
    });
    const datosPrueba = {
      ...registerUser,
      licport: 5432,
      licnivel: "admin",
      licpasdatabase: "123",
      prueba: false,
      licip: "localhost",
      licfechafin: fechaVencimiento,
    };
    setRegisterUser(datosPrueba);
    setIsOpenPayment(true);
    // if (pagos) {
    //   const datosPrueba = {
    //     ...registerUser,
    //     licport: 5432,
    //     licnivel: "admin",
    //     licpasdatabase: "123",
    //     prueba: false,
    //     licip: "localhost",
    //     licfechafin: new Date(new Date().setMonth(new Date().getMonth() + 6))
    //       .toISOString()
    //       .split("T")[0],
    //   };
    //   console.log(datosPrueba);
    //   await registrarme(datosPrueba);
    //   setUsuario({
    //     ...usuario,
    //     email: datosPrueba?.licemail,
    //     pass: datosPrueba?.licpassword,
    //   });
    //   setRegisterUser(datosPrueba);
    //   setIsModalOpen(false);
    //   setIsLogin(true);
    // } else
    //   addToast({
    //     type: "error",
    //     title: "Error",
    //     message: "El pago no se ha podido procesar, Intentelo nuevamente",
    //     duration: 3000,
    //   });
  };
  const crearCuentaEmprendedorAnual = async () => {
    console.log("debe pagar 900.000");
  };
  const crearCuentaProfesionalMes = async () => {
    console.log("debe pagar 500.000");
  };
  const crearCuentaProfesionalAnual = async () => {
    console.log("debe pagar 160.000");
  };
  const acceder = async () => {
    try {
      const response = await sendData(
        iniciarSesion,
        "POST",
        `?email=${usuario.email}&pass=${usuario.pass}`
      );
      if (response.status === 200) {
        navigate("/home");
        setUser(response.data);
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

  const registrarme = async (datos) => {
    try {
      const response = await sendData(resgitrarmePrueba, "POST", null, datos);
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
  };
  return (
    <>
      <Planes
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        validarRegistrarmePrueba={validarRegistrarmePrueba}
        crearCuentaEmprendedorMes={crearCuentaEmprendedorMes}
        crearCuentaEmprendedorAnual={crearCuentaEmprendedorAnual}
        crearCuentaProfesionalMes={crearCuentaProfesionalMes}
        crearCuentaProfesionalAnual={crearCuentaProfesionalAnual}
      />
      <Payment
        setIsOpen={setIsOpenPayment}
        isOpen={isOpenPayment}
        setDetallePlan={setDetallePlan}
        detalles={detallePlan}
      />
      <div className="login-page">
        {/* <video
          className="background-video"
          src="/public/videopreba.mp4"
          autoPlay
          loop
          muted
        /> */}
        {/* <img
          src="/public/prueba.jpg"
          alt="Mountain landscape"
          className="background-video"
        /> */}
        <div className="login-container">
          <div className="login-form-section">
            <div className="form-wrapper">
              <h1 className="welcome-title">BIENVENIDOS 👋</h1>
              <p className="subtitle">Sitema de Facturación </p>
              <div
                className={`login-form ${
                  isLogin ? "login-mode" : "register-mode"
                }`}
              >
                {isLogin ? (
                  <div className="form-fields login-fields">
                    <div className="input-group">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={usuario?.email}
                        onChange={handleChangelogin}
                        className="form-input"
                      />
                    </div>
                    <div className="input-group">
                      <input
                        type="password"
                        name="pass"
                        value={usuario?.pass}
                        placeholder="Password"
                        onChange={handleChangelogin}
                        className="form-input"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="form-fields register-fields">
                    <div className="input-row">
                      <div className="input-group">
                        <input
                          name="licnombre"
                          placeholder="Nombre"
                          onChange={handleChangeRegistrar}
                          className="form-input"
                        />
                      </div>
                      <div className="input-group">
                        <input
                          type="text"
                          name="licapellido"
                          placeholder="Apellido"
                          onChange={handleChangeRegistrar}
                          className="form-input"
                        />
                      </div>
                    </div>
                    <div className="input-row">
                      <div className="input-group">
                        <input
                          type="text"
                          name="licruc"
                          placeholder="Ruc / C.I"
                          onChange={handleChangeRegistrar}
                          className="form-input"
                        />
                      </div>
                      <div className="input-group">
                        <input
                          type="text"
                          name="licdireccion"
                          placeholder="Dirección"
                          className="form-input"
                          onChange={handleChangeRegistrar}
                        />
                      </div>
                    </div>
                    <div className="input-row">
                      <div className="input-group">
                        <input
                          type="text"
                          name="lictel"
                          placeholder="Celular"
                          className="form-input"
                          onChange={handleChangeRegistrar}
                        />
                      </div>
                      <div className="input-group">
                        <input
                          type="email"
                          name="licemail"
                          placeholder="Email"
                          className="form-input"
                          onChange={handleChangeRegistrar}
                        />
                      </div>
                    </div>
                    <div className="input-row">
                      <div className="input-group">
                        <input
                          type="password"
                          name="licpassword"
                          placeholder="Contraseña"
                          className="form-input"
                          onChange={handleChangeRegistrar}
                        />
                      </div>
                      <div className="input-group">
                        <input
                          type="password"
                          name="licpassword"
                          placeholder="Confirmar Contraseña"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {isLogin ? (
                  <div className="form-options">
                    <label className="checkbox-container"></label>
                    <a href="#" className="forgot-password">
                      Olvidate tu contraseña?
                    </a>
                  </div>
                ) : (
                  ""
                )}

                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => {
                    if (isLogin) {
                      acceder();
                    } else {
                      setIsModalOpen(true);
                    }
                  }}
                >
                  {isLogin ? "Ingresar" : "Crear Cuenta"}
                </button>
              </div>

              <div className="switch-mode">
                <span>
                  {isLogin
                    ? "Aún no tienes una cuenta ?"
                    : "Ya tienes una cuenta ?"}
                </span>
                <button
                  className="switch-btn"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Crear Cuenta" : "Iniciar Sesion"}
                </button>
              </div>
            </div>
          </div>

          <div className="image-section">
            <img
              src="/public/prueba.jpg"
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
