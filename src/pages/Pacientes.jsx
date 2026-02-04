import { useState, useRef, useEffect } from "react";
import { addToast } from "../components/Tooltip";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { sendData } from "../services/api";
import {
  editarPacientes,
  eliminarPacientes,
  grabarPacientes,
  listarPacientes,
} from "../services/urls";
import { calcRows } from "../components/Formatos";
import ModalDelete from "../components/ModalDelete";
import { useNavigate } from "react-router-dom";
import { NoEmpty } from "../components/NoEmpty";

const Pacientes = () => {
  const [pagina, setPagina] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [listPacientes, setListPacientes] = useState([]);
  const tableWrapperRef = useRef(null);
  const rowRef = useRef(null);
  const [modo, setModo] = useState("INS");
  const [filas, setFilas] = useState(8);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const { validate, clearErrors } = NoEmpty();
  const [tituloModal, setTituloModal] = useState("");
  const [descripcionEliminar, setDescripcionEliminar] = useState("");
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState({
    id: 0,
    nombre: "",
    apellido: "",
    fechanacimiento: "",
    ruc: "",
    celular: "",
    mail: "",
    direccion: "",
  });

  const getPacientes = async () => {
    try {
      cargarLoader();
      const response = await sendData(listarPacientes, "GET", null, null);
      if (response.status === 200) {
        setListPacientes(response?.data);
        setTituloModal("");
        setDescripcionEliminar("");
        setVisible(false);
        setActiveTooltip(null);
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

  const handleChangePacientes = (event) => {
    setPaciente((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const TooltipActions = ({ paciente }) => {
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    const isActive = activeTooltip === paciente;

    useEffect(() => {
      if (isActive && tooltipRef.current && triggerRef.current) {
        const tooltip = tooltipRef.current;
        const trigger = triggerRef.current;

        const triggerRect = trigger.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "1";
        tooltip.style.display = "block";

        const tooltipRect = tooltip.getBoundingClientRect();

        tooltip.style.visibility = "";
        tooltip.style.opacity = "";
        tooltip.style.display = "";
        tooltip.className = "tooltip-menu active";

        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        let top, left;

        if (spaceBelow >= tooltipRect.height + 16) {
          top = triggerRect.bottom + 8;
        } else if (spaceAbove >= tooltipRect.height + 16) {
          top = triggerRect.top - tooltipRect.height - 8;
        } else {
          top =
            spaceBelow > spaceAbove
              ? triggerRect.bottom + 8
              : triggerRect.top - tooltipRect.height - 8;
        }

        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

        if (left < 20) left = 20;
        if (left + tooltipRect.width > viewportWidth - 20)
          left = viewportWidth - tooltipRect.width - 20;

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.transform = "none";
      }
    }, [isActive]);

    const handleToggle = (e) => {
      e.stopPropagation();
      setActiveTooltip(isActive ? null : paciente);
    };

    const handleAction = (action) => {
      if (action === "Eliminar") {
        setTituloModal("Atención");
        setDescripcionEliminar(paciente?.nombre + " " + paciente?.apellido);
        setVisible(true);
        setActiveTooltip(null);
        setPaciente(paciente);
      } else if (action === "Editar") {
        setActiveTooltip(null);
        setPaciente(paciente);
        setModo("UPD");
        setOpenModal(true);
      }
    };

    return (
      <div className="tooltip-wrapper">
        <button
          ref={triggerRef}
          className="tooltip-trigger"
          onClick={handleToggle}
        >
          <i className="fas fa-ellipsis-v"></i>
        </button>

        <div
          ref={tooltipRef}
          className={`tooltip-menu ${isActive ? "active" : ""}`}
        >
          <button
            className="tooltip-item tooltip-item--edit"
            onClick={() => handleAction("Editar")}
          >
            <i className="fas fa-edit"></i>
            <span>Editar</span>
          </button>

          <div className="tooltip-divider"></div>

          <button
            className="tooltip-item tooltip-item--delete"
            onClick={() => handleAction("Eliminar")}
          >
            <i className="fas fa-trash-alt"></i>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    );
  };

  const postPacientes = async () => {
    clearErrors();
    if (!validate()) return;
    try {
      cargarLoader();
      const response = await sendData(
        modo === "INS" ? grabarPacientes : editarPacientes,
        "POST",
        null,
        paciente,
      );
      if (response.status === 200) {
        await getPacientes();
        addToast({
          type: "success",
          title: "Paciente Grabado",
          message: response?.mensaje,
          duration: 3000,
        });
        setOpenModal(false);
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
    } finally {
      ocultarLoader();
    }
  };

  useEffect(() => {
    if (tableWrapperRef.current && rowRef.current) {
      setFilas(calcRows(tableWrapperRef.current, rowRef.current));
    }
  }, [listPacientes]);

  const eliminarPaciente = async () => {
    try {
      const response = await sendData(
        `${eliminarPacientes}?id=${paciente?.id}`,
        "DELETE",
        null,
        null,
      );
      if (response.status === 200) {
        addToast({
          type: "success",
          title: "Eliminado",
          message: response?.mensaje,
          duration: 3000,
        });
        await getPacientes();
      }
    } finally {
      ocultarLoader();
    }
  };

  useEffect(() => {
    getPacientes();
    const handleClickOutside = (e) => {
      if (!e.target.closest(".tooltip-wrapper")) setActiveTooltip(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const pacientesFiltrados = listPacientes.filter((p) => {
    const t = search.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(t) ||
      p.apellido?.toLowerCase().includes(t) ||
      p.mail?.toLowerCase().includes(t) ||
      p.celular?.toLowerCase().includes(t) ||
      p.ruc?.toLowerCase().includes(t)
    );
  });

  const totalPaginas = Math.ceil(pacientesFiltrados.length / filas);
  const inicio = pagina * filas;
  const fin = inicio + filas;
  const pacientesPaginados = pacientesFiltrados.slice(inicio, fin);

  return (
    <>
      <ModalDelete
        visible={visible}
        setVisible={setVisible}
        titulo={tituloModal}
        eliminar={descripcionEliminar}
        funcion={eliminarPaciente}
      />

      {/* TABLA */}
      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Pacientes</h1>
            <p className="mock-papers__subtitle">
              Gestión y seguimiento de pacientes
            </p>
          </div>

          <div className="mock-papers__search">
            <input
              type="text"
              className="input-field input-field--search"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagina(0);
              }}
            />
          </div>

          <button
            className="mock-papers__upload-btn"
            onClick={() => {
              setModo("INS");
              setPaciente({
                id: 0,
                nombre: "",
                apellido: "",
                fechanacimiento: "",
                ruc: "",
                celular: "",
                mail: "",
                direccion: "",
              });
              setOpenModal(true);
            }}
          >
            NUEVO <i className="fas fa-plus" />
          </button>
        </div>

        <div className="mock-papers__table-card">
          <div className="mock-papers__table-wrapper" ref={tableWrapperRef}>
            <table className="mock-papers__table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesPaginados.length > 0 ? (
                  pacientesPaginados.map((p, i) => (
                    <tr key={p.id} ref={i === 0 ? rowRef : null}>
                      <td>{String(inicio + i + 1).padStart(2, "0")}</td>
                      <td>
                        {p.nombre} {p.apellido}
                      </td>
                      <td>{p.mail}</td>
                      <td>{p.celular}</td>
                      <td>
                        <TooltipActions paciente={p} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="busquedaSinresultado" colSpan={6}>
                      <i className="fa-solid fa-file-circle-exclamation"></i>{" "}
                      Sin Datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mock-papers__pagination">
            <button
              className="mock-papers__arrow-btn"
              disabled={pagina === 0}
              onClick={() => setPagina((p) => Math.max(p - 1, 0))}
            >
              ←
            </button>
            <span className="mock-papers__page-btn">{pagina + 1}</span>/
            <span className="mock-papers__page-btn">{totalPaginas}</span>
            <button
              className="mock-papers__arrow-btn"
              disabled={pagina + 1 >= totalPaginas}
              onClick={() =>
                setPagina((p) => Math.min(p + 1, totalPaginas - 1))
              }
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <div
        className="modal-overlay"
        style={{ display: openModal ? "flex" : "none" }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">Registro De Paciente</h2>
            <button className="modal-close" onClick={() => setOpenModal(false)}>
              &times;
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Nombre</label>
                <input
                  type="text"
                  className="input-field"
                  name="nombre"
                  value={paciente?.nombre}
                  onChange={handleChangePacientes}
                  noempty="true"
                  validar="Ingrese el nombre"
                  placeholder="Escribe aquí..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Apellido</label>
                <input
                  type="text"
                  className="input-field"
                  name="apellido"
                  value={paciente?.apellido}
                  onChange={handleChangePacientes}
                  noempty="true"
                  validar="Ingrese el apellido"
                  placeholder="Escribe aquí..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Fecha Nacimiento</label>
                <input
                  type="date"
                  className="input-field"
                  name="fechanacimiento"
                  value={paciente?.fechanacimiento}
                  onChange={handleChangePacientes}
                  noempty="true"
                  validar="Ingrese la fecha de nacimiento"
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Edad</label>
                <input
                  type="text"
                  className="input-field"
                  value={
                    paciente?.fechanacimiento
                      ? Math.floor(
                          (new Date() - new Date(paciente.fechanacimiento)) /
                            (1000 * 60 * 60 * 24 * 365.25),
                        )
                      : ""
                  }
                  disabled
                  placeholder="Edad"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Cédula / Ruc</label>
                <input
                  type="text"
                  className="input-field"
                  name="ruc"
                  value={paciente?.ruc}
                  onChange={handleChangePacientes}
                  noempty="true"
                  validar="Ingrese la cédula o ruc"
                  placeholder="Escribe aquí..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Celular</label>
                <input
                  type="text"
                  className="input-field"
                  name="celular"
                  value={paciente?.celular}
                  onChange={handleChangePacientes}
                  noempty="true"
                  validar="Ingrese el nro de celular"
                  placeholder="Escribe aquí..."
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">E-mail</label>
                <input
                  type="email"
                  className="input-field"
                  name="mail"
                  value={paciente?.mail}
                  onChange={handleChangePacientes}
                  noempty="true"
                  validar="Ingrese el E-mail"
                  placeholder="Escribe aquí..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Dirección</label>
                <input
                  type="text"
                  className="input-field"
                  name="direccion"
                  value={paciente?.direccion}
                  onChange={handleChangePacientes}
                  noempty="true"
                  validar="Ingrese la dirección"
                  placeholder="Escribe aquí..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setOpenModal(false)}>
              Cancelar
            </button>
            <button className="btn-submit" onClick={postPacientes}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pacientes;
