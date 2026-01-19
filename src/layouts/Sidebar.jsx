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
          <i className="fas fa-house" />
          <span>Inicio</span>
        </div>

        <div
          className={`menu-item ${isActive("/doctores") ? "active" : ""}`}
          onClick={() => navigate("/doctores")}
        >
          <i className="fas fa-user-doctor" />
          <span>Doctores</span>
        </div>

        <div
          className={`menu-item ${isActive("/pacientes") ? "active" : ""}`}
          onClick={() => navigate("/pacientes")}
        >
          <i className="fas fa-users" />
          <span>Pacientes</span>
        </div>

        <div
          className={`menu-item ${isActive("/turnos") ? "active" : ""}`}
          onClick={() => navigate("/turnos")}
        >
          <i className="fas fa-calendar-check" />
          <span>Turnos</span>
        </div>

        <div
          className={`menu-item ${isActive("/productos") ? "active" : ""}`}
          onClick={() => navigate("/productos")}
        >
          <i className="fas fa-boxes-stacked" />
          <span>Productos</span>
        </div>
        <div className={`menu-item ${isActive("/caja") ? "active" : ""}`}>
          <i class="fas fa-hand-holding-usd"></i>
          <span>Caja</span>
        </div>
        <div
          className={`menu-item ${isActive("/presupuesto") ? "active" : ""}`}
        >
          <i className="fas fa-file-invoice-dollar" />
          <span>Presupuesto</span>
        </div>

        <div
          className={`menu-item ${isActive("/consentimiento") ? "active" : ""}`}
        >
          <i className="fas fa-file-signature" />
          <span>Consentimiento</span>
        </div>

        <div
          className={`menu-item ${isActive("/auditoria") ? "active" : ""}`}
          onClick={() => navigate("/auditoria")}
        >
          <i className="fas fa-clipboard-check" />
          <span>Auditoria</span>
        </div>

        <div className="menu-item cerrarsesion">
          <i className="fas fa-right-from-bracket" />
          <span>Cerrar Sesión</span>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
