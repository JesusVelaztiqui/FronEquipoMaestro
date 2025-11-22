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
          <i className="fas fa-home"></i>
          <span>Dashboard</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-grid"></i>
          <span>Utilities</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-cog"></i>
          <span>Settings</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-envelope"></i>
          <span>Messages</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-chart-bar"></i>
          <span>Analytics</span>
        </div>
        <div className="menu-item">
          <i className="fas fa-circle-question"></i>
          <span>Support</span>
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
