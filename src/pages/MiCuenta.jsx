import { useState, useEffect } from "react";
import { sendData } from "../services/api";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { modificarUsuario } from "../services/urls";
import { useNavigate } from "react-router-dom";
import useUserStore from "../features/auth/zustandUser";

const MiCuenta = () => {
  const navigate = useNavigate();
  const { clearUser } = useUserStore();
  const [form, setForm] = useState({
    mail: "",
    passAnterior: "",
    nuevoPass: "",
    nuevoPassCopy: "",
  });

  const mailAnterior =
    JSON.parse(localStorage.getItem("usuarioMaestro"))?.email || "";

  useEffect(() => {
    setForm((prev) => ({ ...prev, mail: mailAnterior }));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGuardar = async () => {
    if (!form.mail) {
      addToast({
        type: "warning",
        title: "Atención",
        message: "Ingrese el correo.",
        duration: 3000,
      });
      return;
    }
    if (!form.passAnterior) {
      addToast({
        type: "warning",
        title: "Atención",
        message: "Ingrese la contraseña actual.",
        duration: 3000,
      });
      return;
    }
    if (!form.nuevoPass) {
      addToast({
        type: "warning",
        title: "Atención",
        message: "Ingrese la nueva contraseña.",
        duration: 3000,
      });
      return;
    }
    if (!form.nuevoPassCopy) {
      addToast({
        type: "warning",
        title: "Atención",
        message: "Confirme la nueva contraseña.",
        duration: 3000,
      });
      return;
    }
    if (form.nuevoPass !== form.nuevoPassCopy) {
      addToast({
        type: "warning",
        title: "Atención",
        message: "Las contraseñas no coinciden.",
        duration: 3000,
      });
      return;
    }

    try {
      cargarLoader();
      const params = new URLSearchParams({
        mailAnterior,
        mail: form.mail,
        passAnterior: form.passAnterior,
        nuevoPass: form.nuevoPass,
        nuevoPassCopy: form.nuevoPassCopy,
      });
      const response = await sendData(
        `${modificarUsuario}?${params.toString()}`,
        "POST",
        null,
        null,
      );
      if (response?.status === 200) {
        addToast({
          type: "success",
          title: "Éxito",
          message: response?.mensaje,
          duration: 3000,
        });
        const usuario = JSON.parse(localStorage.getItem("usuarioMaestro"));
        if (usuario) {
          usuario.email = form.mail;
          localStorage.setItem("usuarioMaestro", JSON.stringify(usuario));
        }
        navigate("/login");
        clearUser();
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: response?.mensaje,
          duration: 3000,
        });
      }
    } catch (error) {
      navigate("/login");
      addToast({
        type: "error",
        title: "Error",
        message: error,
        duration: 3000,
      });
    } finally {
      ocultarLoader();
    }
  };

  return (
    <div className="recetario-page">
      <div className="recetario-form">
        <div>
          <h1 className="mock-papers__title">Mi Cuenta</h1>
          <p className="mock-papers__subtitle">
            Gestión de credenciales de acceso
          </p>
        </div>

        <div className="recetario-form__card">
          <div className="input-group">
            <label className="input-label">Correo actual</label>
            <input
              type="text"
              className="input-field"
              value={mailAnterior}
              disabled
            />
          </div>

          <div className="input-group">
            <label className="input-label">Nuevo correo</label>
            <input
              type="email"
              className="input-field"
              name="mail"
              value={form.mail}
              onChange={handleChange}
              placeholder="Ingrese el nuevo correo..."
            />
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña actual</label>
            <input
              type="password"
              className="input-field"
              name="passAnterior"
              value={form.passAnterior}
              onChange={handleChange}
              placeholder="Ingrese la contraseña actual..."
            />
          </div>

          <div className="input-group">
            <label className="input-label">Nueva contraseña</label>
            <input
              type="password"
              className="input-field"
              name="nuevoPass"
              value={form.nuevoPass}
              onChange={handleChange}
              placeholder="Ingrese la nueva contraseña..."
            />
          </div>

          <div className="input-group">
            <label className="input-label">Confirmar nueva contraseña</label>
            <input
              type="password"
              className="input-field"
              name="nuevoPassCopy"
              value={form.nuevoPassCopy}
              onChange={handleChange}
              placeholder="Repita la nueva contraseña..."
            />
          </div>

          <button className="recetario-form__btn" onClick={handleGuardar}>
            <i className="fas fa-save"></i>
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="recetario-preview">
        <div className="recetario-preview__topbar">
          <span className="recetario-preview__label">
            <i className="fas fa-user-circle"></i>
            Información de la cuenta
          </span>
        </div>

        <div className="recetario-slider__stage">
          <div className="recetario-paper">
            <div className="recetario-paper__header">
              <div className="recetario-paper__logo-area">
                <div className="recetario-paper__logo-placeholder">
                  <img src="/LogoSinFondo.png" alt="Equipo Maestro" />
                </div>
              </div>
              <h2 className="recetario-paper__brand">Equipo Maestro</h2>
              <p className="recetario-paper__brand-sub">
                Odontología Multidisciplinar
              </p>
              <div className="recetario-paper__divider"></div>

              <div className="recetario-paper__patient-row">
                <div className="recetario-paper__field recetario-paper__field--wide">
                  <span className="recetario-paper__field-label">Usuario:</span>
                  <div className="recetario-paper__field-input">
                    <span className="recetario-paper__field-text">
                      {mailAnterior}
                    </span>
                    <div className="recetario-paper__field-line"></div>
                  </div>
                </div>
              </div>

              <p className="recetario-paper__section-title">Datos de acceso</p>
            </div>

            <div className="recetario-paper__content">
              <p className="recetario-paper__line">
                Para modificar tus credenciales completá el formulario con tu
                correo actual y la contraseña vigente, luego ingresá la nueva
                contraseña dos veces para confirmarla.
              </p>
              <p className="recetario-paper__line">&nbsp;</p>
              <p className="recetario-paper__line">
                Una vez guardado, el sistema actualizará tu sesión con el nuevo
                correo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiCuenta;
