import { useState } from "react";

const Turnos = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);

  const mockTurnos = [
    {
      id: 1,
      paciente: "Juan Pérez",
      medico: "Dra. Ana Solis",
      fecha: "15/12/2024",
      hora: "09:00",
      estado: "Confirmado",
      tratamiento: "Limpieza dental",
    },
    {
      id: 2,
      paciente: "María González",
      medico: "Dra. Carolina Sosa",
      fecha: "15/12/2024",
      hora: "10:30",
      estado: "Pendiente",
      tratamiento: "Extracción",
    },
    {
      id: 3,
      paciente: "Carlos Benítez",
      medico: "Dra. Patricia Ojeda",
      fecha: "16/12/2024",
      hora: "14:00",
      estado: "Confirmado",
      tratamiento: "Ortodoncia",
    },
    {
      id: 4,
      paciente: "Laura Martínez",
      medico: "Dra. Ana Solis",
      fecha: "16/12/2024",
      hora: "15:30",
      estado: "Cancelado",
      tratamiento: "Endodoncia",
    },
    {
      id: 5,
      paciente: "Roberto Silva",
      medico: "Dra. Carolina Sosa",
      fecha: "17/12/2024",
      hora: "11:00",
      estado: "Confirmado",
      tratamiento: "Implante",
    },
    {
      id: 6,
      paciente: "Ana López",
      medico: "Dra. Patricia Ojeda",
      fecha: "17/12/2024",
      hora: "16:00",
      estado: "Pendiente",
      tratamiento: "Control",
    },
  ];

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Confirmado":
        return "turno-estado--confirmado";
      case "Pendiente":
        return "turno-estado--pendiente";
      case "Cancelado":
        return "turno-estado--cancelado";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Turnos</h1>
            <p className="mock-papers__subtitle">
              Gestiona los turnos y citas de tus pacientes
            </p>
          </div>

          <div className="mock-papers__search">
            <div className="input-group">
              <div className="input-search">
                <input
                  type="text"
                  className="input-field input-field--search"
                  placeholder="Buscar por paciente o médico..."
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
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Tratamiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockTurnos.map((turno, index) => (
                  <tr key={turno.id}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{turno.paciente}</td>
                    <td>{turno.medico}</td>
                    <td>{turno.fecha}</td>
                    <td>{turno.hora}</td>
                    <td>{turno.tratamiento}</td>
                    <td>
                      <span
                        className={`turno-estado ${getEstadoClass(
                          turno.estado
                        )}`}
                      >
                        {turno.estado}
                      </span>
                    </td>
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

      <div
        className="modal-overlay"
        style={{ display: openModal ? "flex" : "none" }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">Nuevo Turno</h2>
            <button className="modal-close" onClick={() => setOpenModal(false)}>
              &times;
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Paciente</label>
                <select className="input-select">
                  <option value="">Seleccionar paciente</option>
                  <option value="1">Juan Pérez</option>
                  <option value="2">María González</option>
                  <option value="3">Carlos Benítez</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Médico</label>
                <select className="input-select">
                  <option value="">Seleccionar médico</option>
                  <option value="1">Dra. Ana Solis</option>
                  <option value="2">Dra. Carolina Sosa</option>
                  <option value="3">Dra. Patricia Ojeda</option>
                </select>
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Fecha</label>
                <input type="date" className="input-field" />
              </div>
              <div className="input-group">
                <label className="input-label">Hora</label>
                <input type="time" className="input-field" />
              </div>
              <div className="input-group">
                <label className="input-label">Estado</label>
                <select className="input-select">
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Tratamiento</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Limpieza dental, Extracción, etc."
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Observaciones</label>
                <textarea
                  className="input-textarea"
                  placeholder="Notas adicionales sobre el turno..."
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

export default Turnos;
