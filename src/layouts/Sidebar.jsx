import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ menuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentRoute = location.pathname.toLowerCase();

  const isActive = (path) => currentRoute === path.toLowerCase();

  return (
    <aside
      className={`sidebar ${menuOpen ? "mobile-visible" : "mobile-hidden"}`}
    >
      <div className="logo">
        <span>E</span>quipo Maestro
      </div>

      <nav>
        <div
          className={`menu-item ${isActive("/inicio") ? "active" : ""}`}
          onClick={() => navigate("/inicio")}
        >
          <i className="fas fa-home" />
          <span>Inicio</span>
        </div>

        <div
          className={`menu-item ${isActive("/doctores") ? "active" : ""}`}
          onClick={() => navigate("/doctores")}
        >
          <i className="fas fa-user" />
          <span>Doctores</span>
        </div>

        <div
          className={`menu-item ${isActive("/pacientes") ? "active" : ""}`}
          onClick={() => navigate("/pacientes")}
        >
          <i className="fas fa-user" />
          <span>Pacientes</span>
        </div>

        <div
          className={`menu-item ${isActive("/turnos") ? "active" : ""}`}
          onClick={() => navigate("/turnos")}
        >
          <i className="fas fa-grid" />
          <span>Turnos</span>
        </div>

        <div className={`menu-item ${isActive("/productos") ? "active" : ""}`}>
          <i className="fas fa-cog" />
          <span>Productos</span>
        </div>

        <div
          className={`menu-item ${isActive("/presupuesto") ? "active" : ""}`}
        >
          <i className="fas fa-envelope" />
          <span>Presupuesto</span>
        </div>

        <div
          className={`menu-item ${isActive("/consentimiento") ? "active" : ""}`}
        >
          <i className="fas fa-chart-bar" />
          <span>Consentimiento</span>
        </div>

        <div
          className={`menu-item ${isActive("/utilitarios") ? "active" : ""}`}
        >
          <i className="fas fa-circle-question" />
          <span>Utilitarios</span>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
