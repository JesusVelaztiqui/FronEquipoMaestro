import { useState } from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z"
                fill="#4F46E5"
              />
            </svg>
          </div>
          <span className="logo-text">Factura Ya!</span>
        </div>
        <button className="menu-toggle" onClick={toggleSidebar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12H21M3 6H21M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="menu-section">
        <h3 className="menu-title">Menu</h3>
        <div className="menu-items">
          <div className="menu-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Dashboard</span>
          </div>

          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Productos</span>
          </div>

          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle
                cx="9"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M2 21v-1a6 6 0 0 1 12 0v1"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="17"
                cy="7"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M23 21v-1a5 5 0 0 0-7-4.58"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Clientes</span>
          </div>

          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 2h12a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2V4a2 2 0 0 1 2-2z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="8"
                y1="9"
                x2="16"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="8"
                y1="13"
                x2="14"
                y2="13"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Ventas</span>
          </div>

          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle
                cx="9"
                cy="21"
                r="1"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="20"
                cy="21"
                r="1"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Compras</span>
          </div>
          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 2h9l5 5v15a0 0 0 0 1 0 0H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <polyline
                points="14,2 14,8 20,8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="8"
                y1="13"
                x2="16"
                y2="13"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="8"
                y1="17"
                x2="16"
                y2="17"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Informes</span>
          </div>
        </div>
      </div>

      <div className="upgrade-section">
        <div className="upgrade-card">
          <div className="upgrade-icon"></div>
          <div className="upgrade-content">
            <p className="upgrade-label">Plan actual:</p>
            <p className="upgrade-plan">Prueba Pro</p>
            <p className="upgrade-description">
              Actualiza a Pro para obtener las últimas y exclusivas funciones
            </p>
            <button className="upgrade-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
              </svg>
              Actualizar a Pro
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m12 1 1.68 2.32L16 2.24l.96 2.68L19.64 4l1.04 2.64L23 8.36l.32 2.64L21 12.68l.32 2.64L23 17l-1.04 2.64L19.64 20l-.96 2.68L16 21.76l-2.32 1.68L12 23l-1.68-1.56L8 21.76l-.96-2.68L4.36 20l-1.04-2.64L1 15.32l-.32-2.64L3 11.32L2.68 8.68L1 7l1.04-2.64L4.36 4l.96-2.68L8 2.24l2.32-1.68z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span>Configuración</span>
        </div>
      </div>

      <div className="user-section">
        <div className="user-profile">
          <div className="user-avatar">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="Brooklyn"
            />
          </div>
          <div className="user-info">
            <span className="user-name">Brooklyn</span>
            <span className="user-plan">Pro trial</span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="user-dropdown"
          >
            <polyline
              points="6,9 12,15 18,9"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
