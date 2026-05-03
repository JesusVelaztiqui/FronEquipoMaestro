import { useState, useRef, useEffect } from "react";
import { addToast } from "../components/Tooltip";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { sendData } from "../services/api";
import {
  listarTratamiento,
  grabarTratamiento,
  editarTratamiento,
  eliminarTratamiento,
  listarPacientes,
} from "../services/urls";
import { calcRows } from "../components/Formatos";
import ModalDelete from "../components/ModalDelete";
import { NoEmpty } from "../components/NoEmpty";
import { useNavigate } from "react-router-dom";

const formatNumerico = (v) => {
  const n = String(v).replace(/\D/g, "");
  return n ? Number(n).toLocaleString("es-PY") : "";
};
const desformatear = (v) => String(v).replace(/\D/g, "");

const formatGs = (v) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }).format(v || 0);

// ── Buscador de paciente ────────────────────────────────────────────────────
const Buscador = ({ label, options, placeholder, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const ref = useRef(null);

  const filtered = options.filter(
    (o) =>
      o.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.apellido.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (value && options.length > 0) {
      const found = options.find((o) => o.id === value);
      if (found) setSelectedLabel(`${found.nombre} ${found.apellido}`);
    }
    if (!value) setSelectedLabel("");
  }, [value, options]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (o) => {
    setSelectedLabel(`${o.nombre} ${o.apellido}`);
    onChange(o.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div className="searchable-select" ref={ref}>
        <div className="select-input" onClick={() => setIsOpen(true)}>
          <input
            type="text"
            className="input-field search-input"
            placeholder={placeholder}
            value={isOpen ? searchTerm : selectedLabel}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setSearchTerm("");
              setIsOpen(true);
            }}
            onBlur={() =>
              setTimeout(() => {
                setIsOpen(false);
                setSearchTerm("");
              }, 150)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered.length === 1) {
                e.preventDefault();
                handleSelect(filtered[0]);
                const focusable = Array.from(
                  document.querySelectorAll(
                    'input:not([disabled]):not([readonly]):not([type="hidden"]), select:not([disabled])',
                  ),
                ).filter((el) => {
                  if (["submit", "button", "reset", "checkbox", "radio"].includes(el.type)) return false;
                  const r = el.getBoundingClientRect();
                  return r.width > 0 && r.height > 0;
                });
                const idx = focusable.indexOf(e.target);
                if (idx >= 0 && idx < focusable.length - 1) focusable[idx + 1].focus();
              }
            }}
          />
          <svg
            className={`dropdown-arrow ${isOpen ? "open" : ""}`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {isOpen && (
          <div
            className="dropdown-menu"
            onMouseDown={(e) => e.preventDefault()}
          >
            {filtered.length > 0 ? (
              filtered.map((o) => (
                <div
                  key={o.id}
                  className={`dropdown-item ${value === o.id ? "selected" : ""}`}
                  onClick={() => handleSelect(o)}
                >
                  {o.nombre} {o.apellido}
                </div>
              ))
            ) : (
              <div className="dropdown-item no-results">
                No se encontraron resultados
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main ────────────────────────────────────────────────────────────────────
const FORM_VACIO = {
  id: 0,
  paciente: 0,
  importetotal: 0,
  fechainicio: "",
  fechafin: null,
  estado: "En proceso",
  descripcion: "",
};

const Tratamiento = () => {
  const navigate = useNavigate();
  const tableWrapperRef = useRef(null);
  const rowRef = useRef(null);
  const { validate, clearErrors } = NoEmpty();

  const [lista, setLista] = useState([]);
  const [listPacientes, setListPacientes] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [modo, setModo] = useState("INS");
  const [openModal, setOpenModal] = useState(false);
  const [filas, setFilas] = useState(8);
  const [pagina, setPagina] = useState(0);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const [descripcionEliminar, setDescripcionEliminar] = useState("");
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [importeDisplay, setImporteDisplay] = useState(0);
  const [saldoDisplay, setSaldoDisplay] = useState(0);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const getLista = async () => {
    try {
      cargarLoader();
      const [resTrat, resPac] = await Promise.all([
        sendData(listarTratamiento, "GET", null, null),
        sendData(listarPacientes, "GET", null, null),
      ]);
      if (resTrat.status === 200) setLista(resTrat.data);
      if (resPac.status === 200) setListPacientes(resPac.data);
    } catch {
      navigate("/login");
    } finally {
      ocultarLoader();
    }
  };

  useEffect(() => {
    getLista();
    const handler = (e) => {
      if (!e.target.closest(".tooltip-wrapper")) setActiveTooltip(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    if (tableWrapperRef.current && rowRef.current)
      setFilas(calcRows(tableWrapperRef.current, rowRef.current));
  }, [lista]);

  const resetForm = () => {
    setForm(FORM_VACIO);
    setImporteDisplay(0);
    setSaldoDisplay(0);
    clearErrors();
  };

  const guardar = async () => {
    clearErrors();
    if (!validate()) return;
    try {
      cargarLoader();
      const url = modo === "INS" ? grabarTratamiento : editarTratamiento;
      const res = await sendData(url, "POST", null, form);
      if (res.status === 200) {
        await getLista();
        addToast({
          type: "success",
          title: modo === "INS" ? "Guardado" : "Actualizado",
          message: res.mensaje,
          duration: 3000,
        });
        setOpenModal(false);
        resetForm();
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: res.mensaje,
          duration: 3000,
        });
      }
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Error al guardar.",
        duration: 3000,
      });
    } finally {
      ocultarLoader();
    }
  };

  const eliminar = async () => {
    try {
      cargarLoader();
      const res = await sendData(
        `${eliminarTratamiento}?id=${form.id}`,
        "DELETE",
        null,
        null,
      );
      if (res.status === 200) {
        await getLista();
        addToast({
          type: "success",
          title: "Eliminado",
          message: res.mensaje,
          duration: 3000,
        });
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: res.mensaje,
          duration: 3000,
        });
      }
    } finally {
      ocultarLoader();
    }
  };

  const TooltipActions = ({ item }) => {
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    const isActive = activeTooltip === item.id;

    useEffect(() => {
      if (isActive && tooltipRef.current && triggerRef.current) {
        const tooltip = tooltipRef.current;
        const trigger = triggerRef.current;
        const tr = trigger.getBoundingClientRect();
        tooltip.style.visibility = "hidden";
        tooltip.style.display = "block";
        const ttr = tooltip.getBoundingClientRect();
        tooltip.style.visibility = "";
        tooltip.style.display = "";
        tooltip.className = "tooltip-menu active";
        const top =
          window.innerHeight - tr.bottom >= ttr.height + 16
            ? tr.bottom + 8
            : tr.top - ttr.height - 8;
        let left = tr.left + tr.width / 2 - ttr.width / 2;
        left = Math.max(20, Math.min(left, window.innerWidth - ttr.width - 20));
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.transform = "none";
      }
    }, [isActive]);

    return (
      <div className="tooltip-wrapper">
        <button
          ref={triggerRef}
          className="tooltip-trigger"
          onClick={(e) => {
            e.stopPropagation();
            setActiveTooltip(isActive ? null : item.id);
          }}
        >
          <i className="fas fa-ellipsis-v" />
        </button>
        <div
          ref={tooltipRef}
          className={`tooltip-menu ${isActive ? "active" : ""}`}
        >
          <button
            className="tooltip-item tooltip-item--edit"
            onClick={() => {
              setForm({
                ...item,
                fechainicio: item.fechainicio || "",
                fechafin: item.fechafin || "",
              });
              setImporteDisplay(formatNumerico(item.importetotal));
              setSaldoDisplay(formatNumerico(item.saldo));
              setModo("UPD");
              setOpenModal(true);
              setActiveTooltip(null);
            }}
          >
            <i className="fas fa-edit" />
            <span>Editar</span>
          </button>
          <div className="tooltip-divider" />
          <button
            className="tooltip-item tooltip-item--delete"
            onClick={() => {
              setForm(item);
              setDescripcionEliminar(item.nombrePaciente);
              setVisible(true);
              setActiveTooltip(null);
            }}
          >
            <i className="fas fa-trash-alt" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    );
  };

  const filtrados = lista.filter((i) => {
    const t = search.toLowerCase();
    return (
      i.nombrePaciente?.toLowerCase().includes(t) ||
      i.estado?.toLowerCase().includes(t) ||
      i.descripcion?.toLowerCase().includes(t)
    );
  });
  const totalPag = Math.ceil(filtrados.length / filas);
  const paginados = filtrados.slice(pagina * filas, pagina * filas + filas);

  return (
    <>
      <ModalDelete
        visible={visible}
        setVisible={setVisible}
        titulo="Atención"
        eliminar={descripcionEliminar}
        funcion={eliminar}
      />

      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Tratamientos</h1>
            <p className="mock-papers__subtitle">
              Seguimiento de tratamientos por paciente
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
              resetForm();
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
                  <th>Paciente</th>
                  <th>Importe Total</th>
                  <th>Saldo</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginados.length > 0 ? (
                  paginados.map((item, i) => (
                    <tr key={item.id} ref={i === 0 ? rowRef : null}>
                      <td>{String(pagina * filas + i + 1).padStart(2, "0")}</td>
                      <td>{item.nombrePaciente}</td>
                      <td>{formatGs(item.importetotal)}</td>
                      <td>{formatGs(item.saldo)}</td>
                      <td>{item.fechainicio || "—"}</td>
                      <td>{item.fechafin || "—"}</td>
                      <td>
                        <span
                          className={`turno-estado turno-estado--${item.estado === "Culminado" ? "confirmado" : "pendiente"}`}
                        >
                          {item.estado}
                        </span>
                      </td>
                      <td>
                        <TooltipActions item={item} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="busquedaSinresultado" colSpan={8}>
                      <i className="fa-solid fa-file-circle-exclamation" /> Sin
                      Datos
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
            <span className="mock-papers__page-btn">{totalPag || 1}</span>
            <button
              className="mock-papers__arrow-btn"
              disabled={pagina + 1 >= totalPag}
              onClick={() => setPagina((p) => Math.min(p + 1, totalPag - 1))}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div
        className="modal-overlay"
        style={{ display: openModal ? "flex" : "none" }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">
              {modo === "INS" ? "Nuevo Tratamiento" : "Editar Tratamiento"}
            </h2>
            <button
              className="modal-close"
              onClick={() => {
                setOpenModal(false);
                resetForm();
              }}
            >
              &times;
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-row">
              <Buscador
                label="Paciente"
                options={listPacientes}
                placeholder="Seleccionar paciente"
                value={form.paciente}
                onChange={(val) => setForm((p) => ({ ...p, paciente: val }))}
              />
              <div className="input-group">
                <label className="input-label">Estado</label>
                <select
                  className="input-select"
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                >
                  <option value="En proceso">En proceso</option>
                  <option value="Culminado">Culminado</option>
                </select>
              </div>
              {modo === "UPD" ? (
                <div className="input-group">
                  <label className="input-label">Fecha Finalización</label>
                  <input
                    type="date"
                    className="input-field"
                    name="fechafin"
                    value={form.fechafin}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <div className="input-group">
                  <label className="input-label">Fecha Inicio</label>
                  <input
                    type="date"
                    className="input-field"
                    name="fechainicio"
                    value={form.fechainicio}
                    onChange={handleChange}
                    noempty="true"
                    validar="Ingrese la fecha de inicio"
                  />
                </div>
              )}
            </div>
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Importe Total</label>
                <input
                  type="text"
                  className="input-field"
                  value={importeDisplay}
                  onChange={(e) => {
                    const r = desformatear(e.target.value);
                    setImporteDisplay(formatNumerico(r));
                    setForm((p) => ({ ...p, importetotal: Number(r) || 0 }));
                  }}
                  placeholder="0"
                  noempty="true"
                  validar="Ingrese el importe total"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Saldo</label>
                <input type="text" disabled className="input-field" value={saldoDisplay} onChange={() => {}} />
              </div>
              <div className="input-group">
                <label className="input-label">Descripción</label>
                <input
                  className="input-field"
                  type="text"
                  name="descripcion"
                  value={form.descripcion || ""}
                  onChange={handleChange}
                  noempty="true"
                  validar="Ingrese la descripción del tratamiento"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn-cancel"
              onClick={() => {
                setOpenModal(false);
                resetForm();
              }}
            >
              Cancelar
            </button>
            <button className="btn-submit" onClick={guardar}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tratamiento;
