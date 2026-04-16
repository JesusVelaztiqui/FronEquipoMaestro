import { useState, useRef, useEffect } from "react";
import { imprimirPdf, sendData } from "../services/api";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { generarRecetario, listarPacientes } from "../services/urls";
import { useNavigate } from "react-router-dom";

const PAGE_CONTENT_HEIGHT = 580;

const TIPOS = [
  {
    id: "indicaciones",
    label: "Indicaciones",
    desc: "Nombre, fecha e indicaciones",
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
  },
  {
    id: "receta",
    label: "Receta Rp/",
    desc: "Nombre, fecha y Rp/",
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6M9 16h6M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/>
        <path d="M8 7h2v5l2-2"/>
      </svg>
    ),
  },
  {
    id: "completo",
    label: "Completo",
    desc: "Indicaciones y Rp/ en una hoja A4 horizontal",
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="10" x2="10" y2="10"/>
        <line x1="5" y1="14" x2="10" y2="14"/>
        <line x1="14" y1="10" x2="19" y2="10"/>
        <line x1="14" y1="14" x2="19" y2="14"/>
      </svg>
    ),
  },
];

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
            onBlur={() => setTimeout(() => { setIsOpen(false); setSearchTerm(""); }, 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredOptions.length === 1) {
                e.preventDefault();
                handleSelect(filteredOptions[0]);
              }
            }}
          />
          <svg className={`dropdown-arrow ${isOpen ? "open" : ""}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const Recetario = () => {
  const [step, setStep] = useState("select"); // "select" | "form"
  const [tipo, setTipo] = useState(null);
  const [pacienteId, setPacienteId] = useState(null);
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [indicaciones, setIndicaciones] = useState("");
  const [rp, setRp] = useState("");
  const [pages, setPages] = useState([""]);
  const [paginaActual, setPaginaActual] = useState(0);
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
    }
  };

  useEffect(() => { getPacientes(); }, []);

  const contentForPagination = tipo === "receta" ? rp : indicaciones;

  useEffect(() => {
    if (tipo === "completo" || !contentForPagination.trim()) {
      setPages([""]);
      return;
    }
    const el = measureRef.current;
    if (!el) return;
    const words = contentForPagination.split(/(\s+)/);
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
    setPaginaActual(0);
  }, [contentForPagination, tipo]);

  const handleSelectTipo = (t) => {
    setTipo(t);
    setStep("form");
  };

  const handleVolver = () => {
    setStep("select");
    setTipo(null);
    resetCampos();
  };

  const resetCampos = () => {
    setPacienteId(null);
    setPacienteNombre("");
    setFecha(new Date().toISOString().split("T")[0]);
    setIndicaciones("");
    setRp("");
    setPages([""]);
    setPaginaActual(0);
  };

  const handleGenerar = async () => {
    if (!pacienteId) {
      addToast({ type: "warning", title: "Atención", message: "Seleccione un paciente.", duration: 3000 });
      return;
    }
    if (!fecha) {
      addToast({ type: "warning", title: "Atención", message: "Ingrese la fecha.", duration: 3000 });
      return;
    }
    if (tipo !== "receta" && !indicaciones.trim()) {
      addToast({ type: "warning", title: "Atención", message: "Ingrese las indicaciones.", duration: 3000 });
      return;
    }
    if (tipo !== "indicaciones" && !rp.trim()) {
      addToast({ type: "warning", title: "Atención", message: "Ingrese la prescripción Rp/.", duration: 3000 });
      return;
    }
    const payload = {
      pacienteId,
      paciente: pacienteNombre,
      fecha: formatFecha(fecha),
      observacion: indicaciones,
      rp,
      tipo,
    };
    const result = await imprimirPdf(payload, generarRecetario, cargarLoader, ocultarLoader);
    if (result) resetCampos();
  };

  // ── Preview components ────────────────────────────────────────────────────

  const HeaderPaper = () => (
    <div className="recetario-paper__header">
      <div className="recetario-paper__logo-area">
        <img src="/LogoSinFondo.png" alt="EM" />
      </div>
      <div className="recetario-paper__divider"/>
      <div className="recetario-paper__patient-row">
        <span className="recetario-paper__field-label">Nombre del paciente:</span>
        <span className="recetario-paper__field-value">{pacienteNombre || "—"}</span>
        <span className="recetario-paper__field-label ml">C.I.:</span>
        <span className="recetario-paper__field-value">—</span>
        <span className="recetario-paper__field-label ml">Fecha:</span>
        <span className="recetario-paper__field-value">{formatFecha(fecha)}</span>
      </div>
    </div>
  );

  const FooterPaper = () => (
    <div className="recetario-paper__footer">
      <p>+595 993 300 369 &nbsp;|&nbsp; equipomaestro_py</p>
      <p>Equipo Maestro &nbsp;|&nbsp; Moises Bertoni N 2839, Asuncion</p>
    </div>
  );

  const renderLines = (text, placeholder) =>
    text ? (
      text.split("\n").map((line, i) => (
        <p key={i} className="recetario-paper__line">{line || "\u00A0"}</p>
      ))
    ) : (
      <p className="recetario-paper__placeholder">{placeholder}</p>
    );

  const PaperPortrait = ({ content, sectionTitle, sectionIsRp, pageNum, totalPages }) => (
    <div className="recetario-paper recetario-paper--portrait">
      <HeaderPaper/>
      <div className="recetario-paper__content">
        <p className={`recetario-paper__section-title${sectionIsRp ? " rp" : ""}`}>{sectionTitle}</p>
        {renderLines(content, sectionIsRp ? "La prescripción aparecerá aquí..." : "Las indicaciones aparecerán aquí...")}
      </div>
      {totalPages > 1 && (
        <div className="recetario-paper__page-num">Página {pageNum} de {totalPages}</div>
      )}
      <FooterPaper/>
    </div>
  );

  const PaperLandscape = () => (
    <div className="recetario-paper recetario-paper--landscape">
      {/* Left panel */}
      <div className="recetario-paper__panel">
        <HeaderPaper/>
        <div className="recetario-paper__content">
          <p className="recetario-paper__section-title">Indicaciones</p>
          {renderLines(indicaciones, "Las indicaciones aparecerán aquí...")}
        </div>
        <FooterPaper/>
      </div>
      {/* Separator */}
      <div className="recetario-paper__vsep"/>
      {/* Right panel */}
      <div className="recetario-paper__panel">
        <HeaderPaper/>
        <div className="recetario-paper__content">
          <p className="recetario-paper__section-title rp">Rp/</p>
          {renderLines(rp, "La prescripción aparecerá aquí...")}
        </div>
        <FooterPaper/>
      </div>
    </div>
  );

  // ── Step 1: Type selection ────────────────────────────────────────────────

  if (step === "select") {
    return (
      <div className="recetario-select-screen">
        <div className="recetario-select-screen__header">
          <h1 className="mock-papers__title">Recetario</h1>
          <p className="mock-papers__subtitle">Seleccioná el tipo de recetario a generar</p>
        </div>
        <div className="recetario-select-screen__cards">
          {TIPOS.map((t) => (
            <button
              key={t.id}
              className="recetario-tipo-card"
              onClick={() => handleSelectTipo(t.id)}
            >
              <span className="recetario-tipo-card__icon">{t.icon}</span>
              <span className="recetario-tipo-card__label">{t.label}</span>
              <span className="recetario-tipo-card__desc">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Step 2: Form + Preview ────────────────────────────────────────────────

  const tipoInfo = TIPOS.find((t) => t.id === tipo);
  const showIndicaciones = tipo === "indicaciones" || tipo === "completo";
  const showRp = tipo === "receta" || tipo === "completo";

  return (
    <div className="recetario-page">
      {/* LEFT FORM */}
      <div className="recetario-form">
        <div className="recetario-form__topbar">
          <button className="recetario-form__back" onClick={handleVolver}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver
          </button>
          <div className="recetario-form__tipo-badge">
            <span>{tipoInfo?.icon && <span className="recetario-form__tipo-icon">{tipoInfo.icon}</span>}</span>
            <span>{tipoInfo?.label}</span>
          </div>
        </div>

        <div>
          <h1 className="mock-papers__title">Recetario</h1>
          <p className="mock-papers__subtitle">{tipoInfo?.desc}</p>
        </div>

        <div className="recetario-form__card">
          <Buscador
            label="Paciente"
            options={listPacientes}
            placeholder="Buscar paciente..."
            value={pacienteId}
            onChange={(p) => { setPacienteId(p.id); setPacienteNombre(`${p.nombre} ${p.apellido}`); }}
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

          {showIndicaciones && (
            <div className="input-group">
              <label className="input-label">Indicaciones</label>
              <textarea
                className="input-textarea recetario-form__textarea"
                value={indicaciones}
                onChange={(e) => setIndicaciones(e.target.value)}
                placeholder="Escriba las indicaciones médicas aquí..."
                rows={tipo === "completo" ? 7 : 12}
              />
            </div>
          )}

          {showRp && (
            <div className="input-group">
              <label className="input-label">
                Rp/ <span className="recetario-form__rp-badge">Prescripción</span>
              </label>
              <textarea
                className="input-textarea recetario-form__textarea"
                value={rp}
                onChange={(e) => setRp(e.target.value)}
                placeholder="Escriba la prescripción aquí..."
                rows={tipo === "completo" ? 7 : 12}
              />
            </div>
          )}

          <button className="recetario-form__btn" onClick={handleGenerar}>
            <i className="fas fa-file-pdf"/>
            Generar Recetario
          </button>
        </div>
      </div>

      {/* RIGHT PREVIEW */}
      <div className="recetario-preview">
        <div className="recetario-preview__topbar">
          <span className="recetario-preview__label">
            <i className="fas fa-eye"/>
            Vista previa
          </span>
          {pages.length > 1 && (
            <span className="recetario-preview__badge">{pages.length} páginas</span>
          )}
        </div>

        {tipo === "completo" ? (
          <div className="recetario-slider">
            <div className="recetario-slider__stage recetario-slider__stage--landscape">
              <PaperLandscape/>
            </div>
          </div>
        ) : (
          <div className="recetario-slider">
            {pages.length > 1 && (
              <button
                className="recetario-slider__arrow recetario-slider__arrow--left"
                onClick={() => setPaginaActual((p) => Math.max(p - 1, 0))}
                disabled={paginaActual === 0}
              >
                <i className="fas fa-chevron-left"/>
              </button>
            )}
            <div className="recetario-slider__stage">
              <PaperPortrait
                content={pages[paginaActual] || ""}
                sectionTitle={tipo === "receta" ? "Rp/" : "Indicaciones"}
                sectionIsRp={tipo === "receta"}
                pageNum={paginaActual + 1}
                totalPages={pages.length}
              />
            </div>
            {pages.length > 1 && (
              <button
                className="recetario-slider__arrow recetario-slider__arrow--right"
                onClick={() => setPaginaActual((p) => Math.min(p + 1, pages.length - 1))}
                disabled={paginaActual === pages.length - 1}
              >
                <i className="fas fa-chevron-right"/>
              </button>
            )}
          </div>
        )}

        {pages.length > 1 && tipo !== "completo" && (
          <div className="recetario-slider__dots">
            {pages.map((_, i) => (
              <button
                key={i}
                className={`recetario-slider__dot ${i === paginaActual ? "recetario-slider__dot--active" : ""}`}
                onClick={() => setPaginaActual(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div ref={measureRef} className="recetario-measure" aria-hidden="true"/>
    </div>
  );
};

export default Recetario;
