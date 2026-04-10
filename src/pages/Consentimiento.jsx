import { useState, useRef, useEffect } from "react";
import { imprimirPdf, sendData } from "../services/api";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { generarConsentimiento, listarDoctores, listarPacientes } from "../services/urls";
import { useNavigate } from "react-router-dom";

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
            onBlur={() =>
              setTimeout(() => {
                setIsOpen(false);
                setSearchTerm("");
              }, 150)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredOptions.length === 1) {
                e.preventDefault();
                handleSelect(filteredOptions[0]);
                const focusable = Array.from(
                  document.querySelectorAll(
                    'input:not([disabled]):not([readonly]):not([type="hidden"]), select:not([disabled])'
                  )
                ).filter((el) => {
                  if (["submit", "button", "reset", "checkbox", "radio"].includes(el.type)) return false;
                  const r = el.getBoundingClientRect();
                  return r.width > 0 && r.height > 0;
                });
                const idx = focusable.indexOf(e.target);
                if (idx >= 0 && idx < focusable.length - 1) {
                  focusable[idx + 1].focus();
                }
              }
            }}
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

const Consentimiento = () => {
  const [pacienteId, setPacienteId] = useState(null);
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [doctorId, setDoctorId] = useState(null);
  const [doctorNombre, setDoctorNombre] = useState("");
  const [procedimiento, setProcedimiento] = useState("");
  const [listPacientes, setListPacientes] = useState([]);
  const [listDoctores, setListDoctores] = useState([]);
  const navigate = useNavigate();

  const getListas = async () => {
    try {
      const [resPacientes, resDoctores] = await Promise.all([
        sendData(listarPacientes, "GET", null, null),
        sendData(listarDoctores, "GET", null, null),
      ]);
      if (resPacientes?.status === 200) setListPacientes(resPacientes.data);
      if (resDoctores?.status === 200) setListDoctores(resDoctores.data);
    } catch {
      navigate("/login");
    }
  };

  useEffect(() => {
    getListas();
  }, []);

  const handleGenerar = async () => {
    if (!pacienteId) {
      addToast({ type: "warning", title: "Atención", message: "Seleccione un paciente.", duration: 3000 });
      return;
    }
    if (!doctorId) {
      addToast({ type: "warning", title: "Atención", message: "Seleccione un doctor.", duration: 3000 });
      return;
    }
    if (!procedimiento.trim()) {
      addToast({ type: "warning", title: "Atención", message: "Ingrese el procedimiento.", duration: 3000 });
      return;
    }
    await imprimirPdf(
      { pacienteId, doctorId, procedimiento },
      generarConsentimiento,
      cargarLoader,
      ocultarLoader,
    );
  };

  const FieldRow = ({ label, value }) => (
    <div className="consent-paper__field-row">
      <span className="consent-paper__field-label">{label}</span>
      <div className="consent-paper__field-input">
        <span className={`consent-paper__field-text${!value ? " consent-paper__field-text--placeholder" : ""}`}>
          {value || "—"}
        </span>
        <div className="consent-paper__field-line" />
      </div>
    </div>
  );

  return (
    <div className="consentimiento-page">
      {/* ── FORM ── */}
      <div className="consentimiento-form">
        <div>
          <h1 className="mock-papers__title">Consentimiento</h1>
          <p className="mock-papers__subtitle">Generación de consentimiento informado</p>
        </div>

        <div className="consentimiento-form__card">
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

          <Buscador
            label="Doctor"
            options={listDoctores}
            placeholder="Buscar doctor..."
            value={doctorId}
            onChange={(d) => {
              setDoctorId(d.id);
              setDoctorNombre(`${d.nombre} ${d.apellido}`);
            }}
          />

          <div className="input-group">
            <label className="input-label">Procedimiento</label>
            <input
              type="text"
              className="input-field"
              value={procedimiento}
              onChange={(e) => setProcedimiento(e.target.value)}
              placeholder="Ej: Extracción dental, Endodoncia..."
            />
          </div>

          <button className="consentimiento-form__btn" onClick={handleGenerar}>
            <i className="fas fa-file-pdf"></i>
            Generar Consentimiento
          </button>
        </div>
      </div>

      {/* ── PREVIEW ── */}
      <div className="consentimiento-preview">
        <div className="consentimiento-preview__topbar">
          <span className="consentimiento-preview__label">
            <i className="fas fa-eye"></i>
            Vista previa
          </span>
        </div>

        <div className="consent-paper">
          {/* Header */}
          <div className="consent-paper__header">
            <div className="consent-paper__logo-area">
              <div className="consent-paper__logo-placeholder">
                <img src="/LogoSinFondo.png" alt="Equipo Maestro" />
              </div>
            </div>
            <h2 className="consent-paper__brand">Equipo Maestro</h2>
            <p className="consent-paper__brand-sub">Odontologia Multidisciplinar</p>
            <div className="consent-paper__divider" />
            <p className="consent-paper__title">Consentimiento Informado</p>
            <div className="consent-paper__fields">
              <FieldRow label="Nombre del paciente:" value={pacienteNombre} />
              <FieldRow label="Doctor/a:" value={doctorNombre ? `Dr/a. ${doctorNombre}` : ""} />
              <FieldRow label="Procedimiento:" value={procedimiento} />
            </div>
            <div className="consent-paper__divider" />
          </div>

          {/* Body */}
          <div className="consent-paper__body">
            <p className="consent-paper__paragraph">
              Yo,{" "}
              <strong>{pacienteNombre || "___________________"}</strong>, declaro haber
              sido informado/a de manera clara y comprensible por el/la{" "}
              <strong>{doctorNombre ? `Dr/a. ${doctorNombre}` : "___________________"}</strong>{" "}
              sobre el siguiente procedimiento odontológico:{" "}
              <strong>{procedimiento || "___________________"}</strong>.
            </p>

            <p className="consent-paper__paragraph">
              He sido informado/a de los siguientes aspectos:
            </p>

            <ul className="consent-paper__list">
              <li>Naturaleza, objetivos y alcance del procedimiento dental propuesto.</li>
              <li>Posibles riesgos, complicaciones o efectos secundarios que puedan surgir.</li>
              <li>Alternativas de tratamiento disponibles y sus respectivas implicaciones.</li>
              <li>Consecuencias de no realizar el tratamiento indicado.</li>
              <li>Mi derecho a retirar este consentimiento en cualquier momento, sin que ello afecte la calidad de mi atención.</li>
            </ul>

            <p className="consent-paper__paragraph">
              El/La <strong>{doctorNombre ? `Dr/a. ${doctorNombre}` : "profesional tratante"}</strong> ha
              respondido satisfactoriamente todas mis preguntas e inquietudes respecto al procedimiento.
            </p>

            <p className="consent-paper__paragraph">
              En pleno uso de mis facultades mentales y de manera libre y voluntaria,{" "}
              <strong>OTORGO MI CONSENTIMIENTO</strong> para la realización del procedimiento indicado,
              comprometiéndome a seguir las indicaciones médicas proporcionadas.
            </p>

            <div className="consent-paper__section-divider" />

            <div className="consent-paper__signatures">
              <div className="consent-paper__signature-block">
                <div className="consent-paper__signature-line" />
                <span className="consent-paper__signature-name">
                  {pacienteNombre || "Paciente"}
                </span>
                <span className="consent-paper__signature-label">Firma del Paciente</span>
              </div>
              <div className="consent-paper__signature-block">
                <div className="consent-paper__signature-line" />
                <span className="consent-paper__signature-name">
                  {doctorNombre ? `Dr/a. ${doctorNombre}` : "Doctor/a"}
                </span>
                <span className="consent-paper__signature-label">Firma del Doctor/a</span>
              </div>
            </div>

            <div className="consent-paper__date-row">
              <span className="consent-paper__date-label">Fecha:</span>
              <div className="consent-paper__date-line" />
            </div>
          </div>

          {/* Footer */}
          <div className="consent-paper__footer">
            <p>+595 993 300 369 &nbsp;|&nbsp; equipomaestro_py</p>
            <p>Equipo Maestro &nbsp;|&nbsp; Moises Bertoni N 2839, Asuncion</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consentimiento;
