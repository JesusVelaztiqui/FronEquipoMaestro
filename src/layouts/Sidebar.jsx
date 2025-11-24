const Sidebar = ({ menuOpen }) => {
  return (
    <aside
      className={`sidebar ${menuOpen ? "mobile-visible" : "mobile-hidden"}`}
    >
      <div className="logo">
        <span>E</span>quipo Maestro
      </div>

      <nav>
        <div className="menu-item active">
          <i className="fas fa-home" />
          <span>Inicio</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-user" />
          <span>Pacientes</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-grid" />
          <span>Turnos</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-cog" />
          <span>Productos</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-envelope" />
          <span>Presupuesto</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-chart-bar" />
          <span>Consentimiento</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-circle-question" />
          <span>Utilitarios </span>
        </div>
      </nav>

      <div className="premium-card">
        <h3>Get a Premium Account</h3>
        <button className="premium-btn">Get Now</button>
      </div>
    </aside>
  );
};

export default Sidebar;
