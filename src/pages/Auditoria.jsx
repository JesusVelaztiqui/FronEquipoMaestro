import { useState } from "react";

const Auditoria = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const mockAuditoria = [
    {
      id: 1,
      fecha: "17/01/25, 16:02",
      nombre: "Dra. Ana Solis",
      accion: "Registro",
      pantalla: "Pacientes",
      concepto: "Nuevo paciente creado, Luis Vargas, 5768983 ",
    },
    {
      id: 2,
      fecha: "17/01/25, 16:02",
      nombre: "Dra. Ana Solis",
      accion: "Modificación",
      pantalla: "Pacientes",
      concepto: "Paciente modificado, Luis Vargas, 5768983",
    },
    {
      id: 3,
      fecha: "17/01/25, 16:02",
      nombre: "Dra. Ana Solis",
      accion: "Eliminación",
      pantalla: "Pacientes",
      concepto: "Paciente eliminado, Luis Vargas, 5768983",
    },
    {
      id: 4,
      fecha: "17/01/25, 16:02",
      nombre: "Vivian Lezcano",
      accion: "Registro",
      pantalla: "Turnos",
      concepto:
        "Turnos Asignado a Dra. Ana Solis en fecha 7/02/25 13:00 al paciente Luis Vargas, 5768983",
    },
  ];

  return (
    <>
      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Auditoria</h1>
            <p className="mock-papers__subtitle">
              Actividades registradas dentro del sistema
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
            style={{ opacity: "0", cursor: "default" }}
            disabled
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
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Pantalla</th>
                  <th>Concepto</th>
                </tr>
              </thead>
              <tbody>
                {mockAuditoria.map((doc, index) => (
                  <tr key={doc.id}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{doc.fecha}</td>
                    <td>{doc.nombre}</td>
                    <td>{doc.accion}</td>
                    <td>{doc.pantalla}</td>
                    <td>{doc.concepto}</td>
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
    </>
  );
};

export default Auditoria;
