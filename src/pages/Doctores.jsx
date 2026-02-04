import { useState, useRef, useEffect } from "react";
import { addToast } from "../components/Tooltip";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { sendData } from "../services/api";
import { listarDoctores } from "../services/urls";
import { calcRows } from "../components/Formatos";

const Doctores = () => {
  const [pagina, setPagina] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [listDoctores, setListDoctores] = useState([]);
  const tableWrapperRef = useRef(null);
  const rowRef = useRef(null);
  const [filas, setFilas] = useState(8);
  const [search, setSearch] = useState("");

  async function getDoctores() {
    try {
      cargarLoader();
      const response = await sendData(listarDoctores, "GET", null, null);
      if (response.status === 200) {
        setListDoctores(response?.data);
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
  }

  const TooltipActions = ({ doctorId }) => {
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    const isActive = activeTooltip === doctorId;

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
          if (spaceBelow > spaceAbove) {
            top = triggerRect.bottom + 8;
          } else {
            top = triggerRect.top - tooltipRect.height - 8;
          }
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
      setActiveTooltip(isActive ? null : doctorId);
    };

    const handleAction = (action) => {
      console.log(`${action} para doctor ID: ${doctorId}`);
      setActiveTooltip(null);
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
            onClick={() => {
              handleAction("Editar");
              setOpenModal(true);
            }}
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

  useEffect(() => {
    if (tableWrapperRef.current && rowRef.current) {
      console.log(calcRows(tableWrapperRef.current, rowRef.current));
      setFilas(calcRows(tableWrapperRef.current, rowRef.current));
    }
  }, [listDoctores]);

  useEffect(() => {
    getDoctores();
    const handleClickOutside = (e) => {
      if (!e.target.closest(".tooltip-wrapper")) setActiveTooltip(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const doctoresFiltrados = listDoctores.filter((doc) => {
    const texto = search.toLowerCase();
    return (
      doc.nombre?.toLowerCase().includes(texto) ||
      doc.apellido?.toLowerCase().includes(texto) ||
      doc.mail?.toLowerCase().includes(texto) ||
      doc.celular?.toLowerCase().includes(texto) ||
      doc.licencia?.toLowerCase().includes(texto)
    );
  });

  const totalPaginas = Math.ceil(doctoresFiltrados.length / filas);
  const inicio = pagina * filas;
  const fin = inicio + filas;
  const doctoresPaginados = doctoresFiltrados.slice(inicio, fin);

  return (
    <>
      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Doctores</h1>
            <p className="mock-papers__subtitle">
              Gestión y administración de profesionales
            </p>
          </div>

          <div className="mock-papers__search">
            <div className="input-group">
              <div className="input-search">
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
                <svg
                  className="input-search__icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <button
            className="mock-papers__upload-btn"
            onClick={() => setOpenModal(true)}
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
                  <th>N° Licencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {doctoresPaginados.length > 0 ? (
                  doctoresPaginados.map((doc, index) => (
                    <tr key={doc.id} ref={index === 0 ? rowRef : null}>
                      <td>{String(inicio + index + 1).padStart(2, "0")}</td>
                      <td>
                        {doc.nombre} {doc.apellido}
                      </td>
                      <td>{doc.mail}</td>
                      <td>{doc.celular}</td>
                      <td>{doc.licencia}</td>
                      <td>
                        <TooltipActions doctorId={doc.id} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="busquedaSinresultado" colSpan="6">
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

      <div
        className="modal-overlay"
        style={{ display: openModal ? "flex" : "none" }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">Registro De Doctores</h2>
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
                  placeholder="Escribe aquí..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Apellido</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Fecha Nacimiento</label>
                <input
                  type="date"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>
            </div>
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Edad</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Cédula / Ruc</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Celular</label>
                <input
                  type="text"
                  className="input-field"
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
                  placeholder="Escribe aquí..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Dirección</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>
            </div>
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Nro Licencia</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setOpenModal(false)}>
              Cancelar
            </button>
            <button className="btn-submit">Guardar</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doctores;
