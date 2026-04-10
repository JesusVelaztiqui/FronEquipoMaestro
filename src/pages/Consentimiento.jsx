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
    await imprimirPdf(
      { pacienteId, doctorId, procedimiento },
      generarConsentimiento,
      cargarLoader,
      ocultarLoader,
    );
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
                El profesional interviniente ha explicado al paciente, de forma clara y en lenguaje comprensible, el procedimiento
                odontologico descripto anteriormente, su finalidad terapeutica o preventiva, la tecnica a emplearse, el tiempo estimado
                de realizacion y los materiales o equipos que se utilizaran. El paciente ha tenido la oportunidad de realizar todas las
                preguntas que considero necesarias.
              </p>
            </div>

            <div className="cp__section">
              <p className="cp__section-heading">2. Riesgos y posibles complicaciones</p>
              <p className="cp__section-text">
                Todo procedimiento odontologico conlleva riesgos inherentes propios de la practica clinica que el paciente acepta
                conocer y asumir. Estos pueden incluir, sin caracter limitativo: molestias o sensibilidad transitoria en la zona tratada,
                reacciones individuales a materiales, medicamentos o agentes utilizados, variaciones en la evolucion clinica segun la
                condicion biologica particular de cada paciente, necesidad de tratamientos complementarios o ajustes no previsibles al
                momento de la consulta, resultados que pueden diferir de los esperados por causas ajenas al profesional, y complicaciones
                derivadas de condiciones medicas preexistentes no declaradas por el paciente. El profesional actuara en todo momento
                conforme a la lex artis y con la diligencia debida. Equipo Maestro no asume responsabilidad por circunstancias
                imprevisibles o ajenas al control clinico razonablemente esperado.
              </p>
            </div>

            <div className="cp__section">
              <p className="cp__section-heading">3. Beneficios esperados del tratamiento</p>
              <p className="cp__section-text">
                El profesional ha informado al paciente sobre los beneficios esperados: restablecer la funcion masticatoria, eliminar
                focos de infeccion o dolor, preservar piezas dentarias, mejorar la estetica o la salud bucodental en general, segun
                corresponda al procedimiento indicado.
              </p>
            </div>

            <div className="cp__section">
              <p className="cp__section-heading">4. Alternativas terapeuticas</p>
              <p className="cp__section-text">
                Se han explicado al paciente las posibles alternativas de tratamiento disponibles, incluyendo las consecuencias de
                optar por no realizar el procedimiento propuesto, entre ellas el posible agravamiento de la condicion bucal, la progresion
                de la patologia y la eventual perdida de piezas dentarias.
              </p>
            </div>

            <div className="cp__section">
              <p className="cp__section-heading">5. Derechos del paciente — Ley N° 68 CN Paraguay / Res. SGN 749/2017 MSPBS</p>
              <ul className="cp__list">
                <li>El paciente tiene derecho a recibir informacion completa, veraz y comprensible sobre su estado de salud bucal y el tratamiento propuesto.</li>
                <li>El paciente puede revocar el presente consentimiento en cualquier momento previo al inicio del procedimiento, sin que ello afecte su derecho a continuar recibiendo atencion odontologica.</li>
                <li>El paciente tiene derecho a solicitar una segunda opinion profesional antes de someterse al procedimiento.</li>
                <li>El paciente puede solicitar, en todo momento, la explicacion de cualquier aspecto del tratamiento que no comprenda.</li>
              </ul>
            </div>

            {/* Declaracion */}
            <div className="cp__block-header">DECLARACION Y CONSENTIMIENTO DEL PACIENTE</div>

            <p className="cp__declaration">
              Yo, <strong>{ph(pacienteNombre)}</strong>, con documento de identidad N° <strong>{ph(pacienteRuc)}</strong>, declaro que he
              leido y comprendido la informacion contenida en el presente formulario. He recibido explicacion verbal del profesional{" "}
              <strong>{doctorNombre ? `Dr/a. ${doctorNombre}` : "—"}</strong> sobre el procedimiento, sus riesgos, beneficios y alternativas
              terapeuticas disponibles. He tenido la oportunidad de formular todas las preguntas que consideré necesarias y las mismas fueron
              respondidas satisfactoriamente. Estando en plenas facultades mentales, de forma libre, voluntaria y sin coaccion de ningun tipo,{" "}
              <strong>OTORGO MI CONSENTIMIENTO INFORMADO</strong> para la realizacion del procedimiento odontologico descrito en el presente
              formulario, en la ciudad de Asuncion, Republica del Paraguay, a la fecha indicada.
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
