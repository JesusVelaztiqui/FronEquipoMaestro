import { useState, useRef, useEffect } from "react";
import { imprimirPdf, sendData } from "../services/api";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { generarRecetario, listarPacientes } from "../services/urls";
import { useNavigate } from "react-router-dom";

const PAGE_CONTENT_HEIGHT = 498;

const formatFecha = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

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
      const encontrado = options.find((o) => o.id === value);
      if (encontrado) setSelectedLabel(`${encontrado.nombre} ${encontrado.apellido}`);
    }
    if (!value) setSelectedLabel("");
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          />
          <svg
            className={`dropdown-arrow ${isOpen ? "open" : ""}`}
            width="20" height="20" viewBox="0 0 20 20" fill="none"
          >
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

const Recetario = () => {
  const [pacienteId, setPacienteId] = useState(null);
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [indicaciones, setIndicaciones] = useState("");
  const [pages, setPages] = useState([""]);
  const [listPacientes, setListPacientes] = useState([]);

  const measureRef = useRef(null);
  const navigate = useNavigate();

  const getPacientes = async () => {
    try {
      const response = await sendData(listarPacientes, "GET", null, null);
      if (response?.status === 200) {
        setListPacientes(response?.data);
      } else {
        addToast({ type: "error", title: "Error", message: response?.mensaje, duration: 3000 });
      }
    } catch (error) {
      navigate("/login");
      addToast({ type: "error", title: "Error", message: error, duration: 3000 });
    }
  };

  useEffect(() => {
    getPacientes();
  }, []);

  useEffect(() => {
    if (!indicaciones.trim()) {
      setPages([""]);
      return;
    }
    const el = measureRef.current;
    if (!el) return;

    const words = indicaciones.split(/(\s+)/);
    const pageTexts = [];
    let current = "";

    for (const token of words) {
      const test = current + token;
      el.innerHTML = test.replace(/\n/g, "<br/>");
      if (el.scrollHeight > PAGE_CONTENT_HEIGHT && current.trim()) {
        pageTexts.push(current.trimEnd());
        current = token.replace(/^\s+/, "");
      } else {
        current = test;
      }
    }
    if (current.trim()) pageTexts.push(current.trimEnd());
    setPages(pageTexts.length > 0 ? pageTexts : [""]);
  }, [indicaciones]);

  const handleGenerar = async () => {
    if (!pacienteId) {
      addToast({ type: "warning", title: "Atención", message: "Seleccione un paciente.", duration: 3000 });
      return;
    }
    if (!fecha) {
      addToast({ type: "warning", title: "Atención", message: "Ingrese la fecha.", duration: 3000 });
      return;
    }
    if (!indicaciones.trim()) {
      addToast({ type: "warning", title: "Atención", message: "Ingrese las indicaciones.", duration: 3000 });
      return;
    }
    await imprimirPdf(
      { paciente: pacienteNombre, fecha: formatFecha(fecha), observacion: indicaciones },
      generarRecetario,
      cargarLoader,
      ocultarLoader,
    );
  };

  const PaperPage = ({ content, pageNum, totalPages }) => (
    <div className="recetario-paper">
      <div className="recetario-paper__header">
        <div className="recetario-paper__logo-area">
          <div className="recetario-paper__logo-placeholder">
            <img src="/LogoSinFondo.png" alt="Equipo Maestro" />
          </div>
        </div>
        <h2 className="recetario-paper__brand">Equipo Maestro</h2>
        <p className="recetario-paper__brand-sub">Odontologia Multidisciplinar</p>
        <div className="recetario-paper__divider"></div>
        <div className="recetario-paper__patient-row">
          <div className="recetario-paper__field recetario-paper__field--wide">
            <span className="recetario-paper__field-label">Nombre del paciente:</span>
            <div className="recetario-paper__field-input">
              <span className="recetario-paper__field-text">{pacienteNombre}</span>
              <div className="recetario-paper__field-line"></div>
            </div>
          </div>
          <div className="recetario-paper__field recetario-paper__field--narrow">
            <span className="recetario-paper__field-label">Fecha:</span>
            <div className="recetario-paper__field-input">
              <span className="recetario-paper__field-text">{formatFecha(fecha)}</span>
              <div className="recetario-paper__field-line"></div>
            </div>
          </div>
        </div>
        <p className="recetario-paper__section-title">Indicaciones</p>
      </div>

      <div className="recetario-paper__content">
        {content ? (
          content.split("\n").map((line, i) => (
            <p key={i} className="recetario-paper__line">{line || "\u00A0"}</p>
          ))
        ) : (
          <p className="recetario-paper__placeholder">Las indicaciones aparecerán aquí...</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="recetario-paper__page-num">Página {pageNum} de {totalPages}</div>
      )}

      <div className="recetario-paper__footer">
        <p>+595 993 300 369 &nbsp;|&nbsp; equipomaestro_py</p>
        <p>Equipo Maestro &nbsp;|&nbsp; Moises Bertoni N 2839, Asuncion</p>
      </div>
    </div>
  );

  return (
    <div className="recetario-page">
      <div className="recetario-form">
        <div>
          <h1 className="mock-papers__title">Recetario</h1>
          <p className="mock-papers__subtitle">Generación de recetas odontológicas</p>
        </div>

        <div className="recetario-form__card">
          <Buscador
            label="Paciente"
            options={listPacientes}
            placeholder="Buscar paciente..."
            value={pacienteId}
            onChange={(p) => {
              setPacienteId(p.id);
              setPacienteNombre(`${p.nombre} ${p.apellido}`);
            }}
          />

          <div className="input-group">
            <label className="input-label">Fecha</label>
            <input
              type="date"
              className="input-field"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Indicaciones</label>
            <textarea
              className="input-textarea recetario-form__textarea"
              value={indicaciones}
              onChange={(e) => setIndicaciones(e.target.value)}
              placeholder="Escriba las indicaciones médicas aquí..."
              rows={14}
            />
          </div>

          <button className="recetario-form__btn" onClick={handleGenerar}>
            <i className="fas fa-file-pdf"></i>
            Generar Recetario
          </button>
        </div>
      </div>

      <div className="recetario-preview">
        <div className="recetario-preview__topbar">
          <span className="recetario-preview__label">
            <i className="fas fa-eye"></i>
            Vista previa
          </span>
          {pages.length > 1 && (
            <span className="recetario-preview__badge">{pages.length} páginas</span>
          )}
        </div>
        <div className="recetario-preview__scroll">
          {pages.map((pageContent, i) => (
            <PaperPage key={i} content={pageContent} pageNum={i + 1} totalPages={pages.length} />
          ))}
        </div>
      </div>

      <div ref={measureRef} className="recetario-measure" aria-hidden="true"></div>
    </div>
  );
};

export default Recetario;
