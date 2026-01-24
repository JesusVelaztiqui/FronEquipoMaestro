import { useState, useRef, useEffect } from "react";

const Productos = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const mockDoctors = [
    {
      id: 1,
      name: "Juan Pérez",
      specialty: "Cardiología",
      phone: "0991 123 456",
      license: "MED-12345",
    },
    {
      id: 2,
      name: "Ana Gómez",
      specialty: "Pediatría",
      phone: "0982 555 222",
      license: "MED-67890",
    },
    {
      id: 3,
      name: "Carlos López",
      specialty: "Dermatología",
      phone: "0971 000 789",
      license: "MED-11111",
    },
  ];

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

        if (left < 20) {
          left = 20;
        }

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
            <h1 className="mock-papers__title">Productos</h1>
            <p className="mock-papers__subtitle">
              Gestión y administración productos odontológicos
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
                  <th>N°</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockDoctors.map((doc, index) => (
                  <tr key={doc.id}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{doc.name}</td>
                    <td>{doc.specialty}</td>
                    <td>{doc.phone}</td>
                    <td>{doc.license}</td>
                    <td>{doc.license}</td>
                    <td>
                      <TooltipActions doctorId={doc.id} />
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

      {/* MODAL */}
      <div
        className="modal-overlay"
        style={{ display: openModal ? "flex" : "none" }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">Registro de producto</h2>
            <button className="modal-close" onClick={() => setOpenModal(false)}>
              &times;
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Código</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Nombre</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Marca</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>
            </div>
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Precio</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Cantidad</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Vencimiento</label>
                <input type="date" className="input-field" />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Descripción</label>
                <textarea
                  className="input-textarea"
                  placeholder="Notas adicionales sobre el producto, indicaciones o advertencias"
                  rows="3"
                ></textarea>
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

export default Productos;
