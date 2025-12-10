import { useState } from "react";

const Doctores = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);

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

  return (
    <>
      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Doctores</h1>
            <p className="mock-papers__subtitle">
              Gestión y administración de profesionales médicos
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
                  <th>Nombre</th>
                  <th>Especialidad</th>
                  <th>Teléfono</th>
                  <th>N° Licencia</th>
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
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn action-btn--edit"
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="action-btn action-btn--delete"
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
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
            <h2 className="modal-title">Registro de Doctor</h2>
            <button className="modal-close" onClick={() => setOpenModal(false)}>
              &times;
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Nombre Completo</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Especialidad</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Cardiología"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Teléfono</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="0991..."
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">N° Licencia Médica</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="MED-xxxxx"
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
