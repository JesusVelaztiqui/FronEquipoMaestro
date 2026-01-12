import { useState, useRef, useEffect } from "react";

const Pacientes = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const mockPapers = [
    {
      id: 1,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 2,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 3,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 4,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 5,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 6,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 7,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 8,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
  ];

  const TooltipActions = ({ paperId }) => {
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    const isActive = activeTooltip === paperId;

    useEffect(() => {
      if (isActive && tooltipRef.current && triggerRef.current) {
        const tooltip = tooltipRef.current;
        const trigger = triggerRef.current;

        const triggerRect = trigger.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Medir el tooltip después de que se muestre
        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "1";
        tooltip.style.display = "block";

        const tooltipRect = tooltip.getBoundingClientRect();

        tooltip.style.visibility = "";
        tooltip.style.opacity = "";
        tooltip.style.display = "";

        // Reset
        tooltip.className = "tooltip-menu active";

        // Calcular posición
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        let top, left;

        // Posición vertical
        if (spaceBelow >= tooltipRect.height + 16) {
          top = triggerRect.bottom + 8;
        } else if (spaceAbove >= tooltipRect.height + 16) {
          top = triggerRect.top - tooltipRect.height - 8;
        } else {
          // Usar el lado con más espacio
          if (spaceBelow > spaceAbove) {
            top = triggerRect.bottom + 8;
          } else {
            top = triggerRect.top - tooltipRect.height - 8;
          }
        }

        // Posición horizontal - centrado por defecto
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

        // Ajustar si se sale por la izquierda
        if (left < 20) {
          left = 20;
        }

        // Ajustar si se sale por la derecha
        if (left + tooltipRect.width > viewportWidth - 20) {
          left = viewportWidth - tooltipRect.width - 20;
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.transform = "none";
      }
    }, [isActive]);

    const handleToggle = (e) => {
      e.stopPropagation();
      setActiveTooltip(isActive ? null : paperId);
    };

    const handleAction = (action) => {
      console.log(`${action} para paciente ID: ${paperId}`);
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
            onClick={() => handleAction("Editar")}
          >
            <i className="fas fa-edit"></i>
            <span>Editar</span>
          </button>

          <button
            className="tooltip-item tooltip-item--view"
            onClick={() => handleAction("Ver Historial")}
          >
            <i className="fas fa-history"></i>
            <span>Ver Historial</span>
          </button>

          <div className="tooltip-divider"></div>

          <button
            className="tooltip-item tooltip-item--export"
            onClick={() => handleAction("Exportar")}
          >
            <i className="fas fa-file-export"></i>
            <span>Exportar</span>
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
    const handleClickOutside = (e) => {
      if (!e.target.closest(".tooltip-wrapper")) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Pacientes</h1>
            <p className="mock-papers__subtitle">
              Gestiona el registro y seguimiento de tus pacientes
            </p>
          </div>

          <div className="mock-papers__search">
            <div className="input-group">
              <div className="input-search">
                <input
                  type="text"
                  className="input-field input-field--search"
                  placeholder="Buscar..."
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
          <div className="mock-papers__table-wrapper">
            <table className="mock-papers__table">
              <thead>
                <tr>
                  <th>S. Number</th>
                  <th>Question</th>
                  <th>Year</th>
                  <th>Student</th>
                  <th>Pages</th>
                  <th>Questions</th>
                  <th>Responses</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockPapers.map((paper, index) => (
                  <tr key={paper.id}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{paper.question}</td>
                    <td>{paper.year}</td>
                    <td>{paper.student}</td>
                    <td>{paper.pages}</td>
                    <td>{paper.questions}</td>
                    <td>{paper.responses}</td>
                    <td>
                      <TooltipActions paperId={paper.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mock-papers__pagination">
            <button
              className={`mock-papers__page-btn ${
                currentPage === 1 ? "active" : ""
              }`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            <button
              className="mock-papers__page-btn"
              onClick={() => setCurrentPage(2)}
            >
              2
            </button>
            <span className="mock-papers__dots">...</span>
            <button className="mock-papers__page-btn">6</button>
            <button className="mock-papers__page-btn">7</button>
            <button className="mock-papers__page-btn">8</button>
            <button className="mock-papers__arrow-btn">→</button>
          </div>
        </div>
      </div>

      <div
        className="modal-overlay"
        style={{ display: openModal ? "flex" : "none" }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">Carga De Paciente</h2>
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
                <label className="input-label">Dirección</label>
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

export default Pacientes;
