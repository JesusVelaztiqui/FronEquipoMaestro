import { useState, useRef, useEffect } from "react";
import { imprimirPdf, sendData } from "../services/api";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { generarConsentimiento, listarDoctores, listarPacientes } from "../services/urls";
import { useNavigate } from "react-router-dom";

const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const fechaLarga = () => {
  const h = new Date();
  return `${String(h.getDate()).padStart(2,"0")} de ${meses[h.getMonth()]} de ${h.getFullYear()}`;
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

const Consentimiento = () => {
  const [pacienteId, setPacienteId]         = useState(null);
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [pacienteRuc, setPacienteRuc]       = useState("");
  const [doctorId, setDoctorId]             = useState(null);
  const [doctorNombre, setDoctorNombre]     = useState("");
  const [doctorLicencia, setDoctorLicencia] = useState("");
  const [procedimiento, setProcedimiento]   = useState("");
  const [exclusiones, setExclusiones]       = useState("");
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
    const result = await imprimirPdf(
      { pacienteId, doctorId, procedimiento, exclusiones },
      generarConsentimiento,
      cargarLoader,
      ocultarLoader,
    );
    if (result) {
      setPacienteId(null);
      setPacienteNombre("");
      setPacienteRuc("");
      setDoctorId(null);
      setDoctorNombre("");
      setDoctorLicencia("");
      setProcedimiento("");
      setExclusiones("");
    }
  };

  const ph = (v) => v || "—";

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
            <label className="input-label">Procedimiento</label>
            <input
              type="text"
              className="input-field"
              value={procedimiento}
              onChange={(e) => setProcedimiento(e.target.value)}
              placeholder="Ej: Extracción dental, Endodoncia..."
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Exclusiones / Consideraciones particulares
              <span style={{ marginLeft: 6, fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              className="input-textarea"
              value={exclusiones}
              onChange={(e) => setExclusiones(e.target.value)}
              rows={4}
              placeholder="Indique aquí exclusiones o limitaciones específicas del caso (ej: no se garantiza la conservación de la pieza, resultado sujeto a respuesta biológica individual, etc.). Si lo deja en blanco, el PDF incluirá el espacio vacío para completar a mano."
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

        <div className="cp">

          {/* DOC HEADER */}
          <div className="cp__doc-header">
            <div className="cp__brand-col">
              <img src="/LogoSinFondo.png" alt="Equipo Maestro" className="cp__logo" />
              <div>
                <p className="cp__brand-name">Equipo Maestro</p>
                <p className="cp__brand-sub">Odontologia Multidisciplinar</p>
              </div>
            </div>
            <div className="cp__title-col">
              <p className="cp__title">CONSENTIMIENTO INFORMADO</p>
              <p className="cp__title-sub">Procedimiento Odontologico — Equipo Maestro</p>
            </div>
          </div>

          {/* INFO GRID */}
          <div className="cp__info-grid">
            <div className="cp__info-cell cp__info-cell--wide">
              <span className="cp__info-label">NOMBRE DEL PACIENTE</span>
              <span className="cp__info-value">{ph(pacienteNombre)}</span>
            </div>
            <div className="cp__info-cell">
              <span className="cp__info-label">CI / RUC</span>
              <span className="cp__info-value">{ph(pacienteRuc)}</span>
            </div>
            <div className="cp__info-cell cp__info-cell--wide">
              <span className="cp__info-label">PROFESIONAL INTERVINIENTE</span>
              <span className="cp__info-value">{doctorNombre ? `Dr/a. ${doctorNombre}` : "—"}</span>
            </div>
            <div className="cp__info-cell">
              <span className="cp__info-label">N° DE LICENCIA / MATRICULA</span>
              <span className="cp__info-value">{ph(doctorLicencia)}</span>
            </div>
            <div className="cp__info-cell cp__info-cell--fecha">
              <span className="cp__info-label">FECHA</span>
              <span className="cp__info-value">{fechaLarga()}</span>
            </div>
          </div>

          {/* BODY */}
          <div className="cp__body">

            {/* Procedimiento */}
            <p className="cp__green-title">Descripcion del procedimiento a realizar</p>
            <div className="cp__proc-box">
              <p className="cp__proc-text">
                {procedimiento || <em className="cp__placeholder">El procedimiento aparecerá aquí...</em>}
              </p>
            </div>

            {/* Secciones */}
            <div className="cp__block-header">
              INFORMACION, RIESGOS Y TERMINOS DEL CONSENTIMIENTO
            </div>

            <div className="cp__section">
              <p className="cp__section-heading">1. Naturaleza del procedimiento</p>
              <p className="cp__section-text">
                El profesional ha explicado al paciente, en lenguaje comprensible, el procedimiento a realizar, su finalidad terapeutica,
                la tecnica a emplear, el tiempo estimado de duracion y los materiales o equipos a utilizar. El paciente ha podido formular
                todas las consultas que considero necesarias.
              </p>
            </div>

            <div className="cp__section">
              <p className="cp__section-heading">2. Riesgos y posibles complicaciones</p>
              <p className="cp__section-text">
                Todo procedimiento conlleva riesgos inherentes a la practica clinica que el paciente acepta conocer y asumir, incluyendo
                sin caracter limitativo: molestias o sensibilidad transitoria, reacciones a materiales o medicamentos empleados, variaciones
                en la evolucion segun la condicion biologica individual, necesidad de tratamientos complementarios no previsibles, resultados
                que pueden diferir de los esperados por causas ajenas al profesional, y complicaciones derivadas de condiciones medicas
                preexistentes no declaradas. El profesional actuara conforme a la lex artis. Equipo Maestro no asume responsabilidad por
                circunstancias ajenas al control clinico razonablemente esperado.
              </p>
            </div>

            <div className="cp__section">
              <p className="cp__section-heading">3. Beneficios esperados del tratamiento</p>
              <p className="cp__section-text">
                El profesional ha informado al paciente sobre los beneficios esperados segun el procedimiento indicado, que pueden incluir:
                restablecer la funcion, eliminar focos infecciosos o dolorosos, preservar estructuras dentarias y mejorar la salud
                bucodental general.
              </p>
            </div>

            <div className="cp__section">
              <p className="cp__section-heading">4. Alternativas terapeuticas</p>
              <p className="cp__section-text">
                Se han explicado las posibles alternativas de tratamiento disponibles y las consecuencias de no realizar el procedimiento
                propuesto, incluyendo el posible agravamiento de la condicion y la eventual perdida de estructuras dentarias afectadas.
              </p>
            </div>

            <div className="cp__section">
              <p className="cp__section-heading">5. Derechos del paciente — Ley N° 68 CN Paraguay / Res. SGN 749/2017 MSPBS</p>
              <ul className="cp__list">
                <li>Derecho a recibir informacion completa y comprensible sobre su condicion y el tratamiento propuesto.</li>
                <li>Derecho a revocar este consentimiento en cualquier momento previo al inicio del procedimiento.</li>
                <li>Derecho a solicitar una segunda opinion profesional antes de someterse al tratamiento.</li>
                <li>La informacion clinica es confidencial y esta protegida por el secreto profesional.</li>
              </ul>
            </div>

            {/* Exclusiones */}
            <div className="cp__exclusiones-header">
              Exclusiones y consideraciones particulares del tratamiento
            </div>
            <p className="cp__section-text" style={{ marginBottom: 6 }}>
              El profesional declara las siguientes exclusiones o limitaciones específicas aplicables al presente caso:
            </p>
            <div className="cp__exclusiones-box">
              {exclusiones
                ? <p className="cp__exclusiones-text">{exclusiones}</p>
                : <p className="cp__exclusiones-placeholder">
                    (espacio para completar a mano o ingresar en el formulario)
                  </p>
              }
            </div>

            {/* Declaracion */}
            <div className="cp__block-header">DECLARACION Y CONSENTIMIENTO DEL PACIENTE</div>

            <p className="cp__declaration">
              Yo, <strong>{ph(pacienteNombre)}</strong>, con documento de identidad N° <strong>{ph(pacienteRuc)}</strong>, declaro que he
              leido y comprendido la informacion contenida en el presente formulario. He recibido explicacion verbal del profesional{" "}
              <strong>{doctorNombre ? `Dr/a. ${doctorNombre}` : "—"}</strong> sobre el procedimiento, sus riesgos, beneficios, alternativas
              terapeuticas y las exclusiones o limitaciones particulares indicadas. He podido formular todas las preguntas que consideré
              necesarias y fueron respondidas satisfactoriamente. Estando en plenas facultades mentales, de forma libre, voluntaria y sin
              coaccion,{" "}<strong>OTORGO MI CONSENTIMIENTO INFORMADO</strong> para la realizacion del procedimiento descripto, en la ciudad
              de Asuncion, Republica del Paraguay, a la fecha indicada.
            </p>

            {/* Firmas */}
            <div className="cp__firmas-header">
              FIRMAS — Ambas partes declaran conformidad con lo expresado en este documento
            </div>

            <div className="cp__firmas-row">
              <div className="cp__firma-block">
                <div className="cp__firma-line" />
                <p className="cp__firma-role">Firma del Profesional</p>
                <p className="cp__firma-name">{doctorNombre ? `Dr/a. ${doctorNombre}` : "—"}</p>
                {doctorLicencia && <p className="cp__firma-sub">Licencia: {doctorLicencia}</p>}
              </div>
              <div className="cp__firma-block">
                <div className="cp__firma-line" />
                <p className="cp__firma-role">Firma del Paciente / Representante Legal</p>
                <p className="cp__firma-name">{ph(pacienteNombre)}</p>
                {pacienteRuc && <p className="cp__firma-sub">CI/RUC: {pacienteRuc}</p>}
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <div className="cp__footer">
            <p>+595 993 300 369 &nbsp;|&nbsp; equipomaestro_py</p>
            <p>Equipo Maestro &nbsp;|&nbsp; Moises Bertoni N 2839, Asuncion — Paraguay</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Consentimiento;
