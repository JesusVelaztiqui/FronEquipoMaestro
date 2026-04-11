import { useState, useRef, useEffect } from "react";
import { imprimirPdf, sendData } from "../services/api";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { generarPresupuesto, listarDoctores, listarPacientes } from "../services/urls";
import { useNavigate } from "react-router-dom";

const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const fechaLarga = (str) => {
  if (!str) return "—";
  const [y, m, d] = str.split("-");
  return `${d} de ${meses[parseInt(m, 10) - 1]} de ${y}`;
};
const fechaHoy = () => {
  const h = new Date();
  return `${String(h.getDate()).padStart(2,"0")} de ${meses[h.getMonth()]} de ${h.getFullYear()}`;
};
const formatGs = (n) =>
  `Gs. ${Number(n || 0).toLocaleString("es-PY", { minimumFractionDigits: 0 })}`;

let nextId = 1;

const Buscador = ({ label, options, placeholder, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(
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
    const handleOut = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleOut);
    return () => document.removeEventListener("mousedown", handleOut);
  }, []);

  const handleSelect = (option) => {
    setSelectedLabel(`${option.nombre} ${option.apellido}`);
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div className="searchable-select" ref={dropdownRef}>
        <div className="select-input" onClick={() => setIsOpen(true)}>
          <input
            type="text"
            className="input-field search-input"
            placeholder={selectedLabel || placeholder}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => { setIsOpen(false); setSearchTerm(""); }, 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredOptions.length === 1) {
                e.preventDefault();
                handleSelect(filteredOptions[0]);
                const focusable = Array.from(
                  document.querySelectorAll(
                    'input:not([disabled]):not([readonly]):not([type="hidden"]), select:not([disabled])'
                  )
                ).filter((el) => {
                  if (["submit","button","reset","checkbox","radio"].includes(el.type)) return false;
                  const r = el.getBoundingClientRect();
                  return r.width > 0 && r.height > 0;
                });
                const idx = focusable.indexOf(e.target);
                if (idx >= 0 && idx < focusable.length - 1) focusable[idx + 1].focus();
              }
            }}
          />
          <svg className={`dropdown-arrow ${isOpen ? "open" : ""}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        {isOpen && (
          <div className="dropdown-menu">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`dropdown-item ${value === option.id ? "selected" : ""}`}
                  onClick={() => handleSelect(option)}
                >
                  {value === option.id && (
                    <svg className="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {option.nombre} {option.apellido}
                </div>
              ))
            ) : (
              <div className="dropdown-item no-results">No se encontraron resultados</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Presupuesto = () => {
  const [pacienteId, setPacienteId]         = useState(null);
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [pacienteRuc, setPacienteRuc]       = useState("");
  const [doctorId, setDoctorId]             = useState(null);
  const [doctorNombre, setDoctorNombre]     = useState("");
  const [doctorLicencia, setDoctorLicencia] = useState("");
  const [fechaValidez, setFechaValidez]     = useState("");
  const [items, setItems]                   = useState([{ id: nextId++, descripcion: "", cantidad: 1, precioUnitario: 0 }]);
  const [listPacientes, setListPacientes]   = useState([]);
  const [listDoctores, setListDoctores]     = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getListas = async () => {
      try {
        const [resPac, resDoc] = await Promise.all([
          sendData(listarPacientes, "GET", null, null),
          sendData(listarDoctores,  "GET", null, null),
        ]);
        if (resPac?.status === 200) setListPacientes(resPac.data);
        if (resDoc?.status === 200) setListDoctores(resDoc.data);
      } catch {
        navigate("/login");
      }
    };
    getListas();
  }, []);

  const agregarItem = () =>
    setItems((prev) => [...prev, { id: nextId++, descripcion: "", cantidad: 1, precioUnitario: 0 }]);

  const eliminarItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const updateItem = (id, field, value) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );

  const subtotalAcum = items.reduce((acc, it) => acc + it.cantidad * it.precioUnitario, 0);

  const handleGenerar = async () => {
    if (!pacienteId) {
      addToast({ type: "warning", title: "Atención", message: "Seleccione un paciente.", duration: 3000 });
      return;
    }
    if (!doctorId) {
      addToast({ type: "warning", title: "Atención", message: "Seleccione un doctor.", duration: 3000 });
      return;
    }
    if (!fechaValidez) {
      addToast({ type: "warning", title: "Atención", message: "Ingrese la fecha de validez.", duration: 3000 });
      return;
    }
    if (items.some((it) => !it.descripcion.trim())) {
      addToast({ type: "warning", title: "Atención", message: "Complete la descripción de todos los ítems.", duration: 3000 });
      return;
    }
    await imprimirPdf(
      {
        pacienteId,
        doctorId,
        fechaValidez,
        items: items.map(({ descripcion, cantidad, precioUnitario }) => ({
          descripcion,
          cantidad: Number(cantidad),
          precioUnitario: Number(precioUnitario),
        })),
      },
      generarPresupuesto,
      cargarLoader,
      ocultarLoader,
    );
  };

  const ph = (v) => v || "—";

  return (
    <div className="presupuesto-page">

      {/* ── FORM ── */}
      <div className="presupuesto-form">
        <div>
          <h1 className="mock-papers__title">Presupuesto</h1>
          <p className="mock-papers__subtitle">Generación de presupuesto odontológico</p>
        </div>

        <div className="presupuesto-form__card">
          <Buscador
            label="Paciente"
            options={listPacientes}
            placeholder="Buscar paciente..."
            value={pacienteId}
            onChange={(p) => {
              setPacienteId(p.id);
              setPacienteNombre(`${p.nombre} ${p.apellido}`);
              setPacienteRuc(p.ruc || "");
            }}
          />

          <Buscador
            label="Doctor"
            options={listDoctores}
            placeholder="Buscar doctor..."
            value={doctorId}
            onChange={(d) => {
              setDoctorId(d.id);
              setDoctorNombre(`${d.nombre} ${d.apellido}`);
              setDoctorLicencia(d.licencia || "");
            }}
          />

          <div className="input-group">
            <label className="input-label">Fecha de Validez</label>
            <input
              type="date"
              className="input-field"
              value={fechaValidez}
              onChange={(e) => setFechaValidez(e.target.value)}
            />
          </div>

          {/* Items */}
          <div className="presupuesto-form__items-header">
            <span className="input-label">Ítems del presupuesto</span>
            <button className="presupuesto-form__add-btn" onClick={agregarItem}>
              <i className="fas fa-plus" /> Agregar
            </button>
          </div>

          <div className="presupuesto-form__items">
            {items.map((item, idx) => (
              <div key={item.id} className="presupuesto-form__item">
                <div className="presupuesto-form__item-num">{idx + 1}</div>
                <div className="presupuesto-form__item-fields">
                  <div className="input-group">
                    <label className="input-label">Descripción</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ej: Extracción dental..."
                      value={item.descripcion}
                      onChange={(e) => updateItem(item.id, "descripcion", e.target.value)}
                    />
                  </div>
                  <div className="presupuesto-form__item-row">
                    <div className="input-group">
                      <label className="input-label">Cantidad</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="0"
                        value={item.cantidad ? Number(item.cantidad).toLocaleString("es-PY") : ""}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          updateItem(item.id, "cantidad", raw === "" ? 0 : parseInt(raw, 10));
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Precio Unit.</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="0"
                        value={item.precioUnitario ? Number(item.precioUnitario).toLocaleString("es-PY") : ""}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          updateItem(item.id, "precioUnitario", raw === "" ? 0 : parseInt(raw, 10));
                        }}
                      />
                    </div>
                  </div>
                </div>
                {items.length > 1 && (
                  <button
                    className="presupuesto-form__del-btn"
                    onClick={() => eliminarItem(item.id)}
                  >
                    <i className="fas fa-trash-alt" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button className="presupuesto-form__btn" onClick={handleGenerar}>
            <i className="fas fa-file-pdf" />
            Generar Presupuesto
          </button>
        </div>
      </div>

      {/* ── PREVIEW ── */}
      <div className="presupuesto-preview">
        <div className="presupuesto-preview__topbar">
          <span className="presupuesto-preview__label">
            <i className="fas fa-eye" />
            Vista previa
          </span>
        </div>

        <div className="pp">

          {/* DOC HEADER */}
          <div className="pp__doc-header">
            <div className="pp__brand-col">
              <img src="/LogoSinFondo.png" alt="Equipo Maestro" className="pp__logo" />
              <div>
                <p className="pp__brand-name">Equipo Maestro</p>
                <p className="pp__brand-sub">Odontologia Multidisciplinar</p>
              </div>
            </div>
            <div className="pp__title-col">
              <p className="pp__title">PRESUPUESTO</p>
              <p className="pp__title-sub">Presupuesto Odontologico — Equipo Maestro</p>
            </div>
          </div>

          {/* INFO GRID */}
          <div className="pp__info-grid">
            <div className="pp__info-cell pp__info-cell--wide">
              <span className="pp__info-label">NOMBRE DEL PACIENTE</span>
              <span className="pp__info-value">{ph(pacienteNombre)}</span>
            </div>
            <div className="pp__info-cell">
              <span className="pp__info-label">CI / RUC</span>
              <span className="pp__info-value">{ph(pacienteRuc)}</span>
            </div>
            <div className="pp__info-cell pp__info-cell--wide">
              <span className="pp__info-label">PROFESIONAL INTERVINIENTE</span>
              <span className="pp__info-value">{doctorNombre ? `Dr/a. ${doctorNombre}` : "—"}</span>
            </div>
            <div className="pp__info-cell">
              <span className="pp__info-label">N° DE LICENCIA / MATRICULA</span>
              <span className="pp__info-value">{ph(doctorLicencia)}</span>
            </div>
            <div className="pp__info-cell">
              <span className="pp__info-label">FECHA DE EMISION</span>
              <span className="pp__info-value">{fechaHoy()}</span>
            </div>
            <div className="pp__info-cell pp__info-cell--last">
              <span className="pp__info-label">FECHA DE VALIDEZ</span>
              <span className="pp__info-value">{fechaLarga(fechaValidez)}</span>
            </div>
          </div>

          {/* TABLA DE ÍTEMS */}
          <div className="pp__body">
            <table className="pp__table">
              <thead>
                <tr>
                  <th className="pp__th pp__th--desc">DESCRIPCIÓN</th>
                  <th className="pp__th pp__th--num">CANT.</th>
                  <th className="pp__th pp__th--num">PRECIO UNIT.</th>
                  <th className="pp__th pp__th--num">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const sub = item.cantidad * item.precioUnitario;
                  return (
                    <tr key={item.id} className={idx % 2 === 0 ? "pp__tr--even" : ""}>
                      <td className="pp__td">{item.descripcion || <em className="pp__placeholder">—</em>}</td>
                      <td className="pp__td pp__td--num">{item.cantidad}</td>
                      <td className="pp__td pp__td--num">{formatGs(item.precioUnitario)}</td>
                      <td className="pp__td pp__td--num">{formatGs(sub)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* TOTALES */}
            <div className="pp__totals">
              <div className="pp__total-row pp__total-row--final">
                <span className="pp__total-label">SUBTOTAL</span>
                <span className="pp__total-value">{formatGs(subtotalAcum)}</span>
              </div>
            </div>

            <p className="pp__nota">
              Este presupuesto tiene validez hasta el <strong>{fechaLarga(fechaValidez)}</strong>. Los precios indicados
              están expresados en Guaraníes (Gs.) e incluyen IVA del 10%. Equipo Maestro se reserva el derecho de
              modificar los valores en caso de variaciones en los costos de materiales o insumos odontológicos.
            </p>
          </div>

          {/* FOOTER */}
          <div className="pp__footer">
            <p>+595 993 300 369 &nbsp;|&nbsp; equipomaestro_py</p>
            <p>Equipo Maestro &nbsp;|&nbsp; Moises Bertoni N 2839, Asuncion — Paraguay</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Presupuesto;
