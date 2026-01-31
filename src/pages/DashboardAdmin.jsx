import { useEffect } from "react";
import useUserStore from "../features/auth/zustandUser";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  // cargarLoader();
  // ocultarLoader();
  const { user, loadUser } = useUserStore();
  const navigate = useNavigate();
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-title">
          <p>Panel de Administración</p>
          <h1>
            {user?.nombre} {user?.apellido}
          </h1>
        </div>
      </header>

      <div className="cards-grid">
        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-users" />
          </div>
          <div className="card-label">Total Pacientes</div>
          <div className="card-amount">1,247</div>
          <div className="card-trend positive">+12% este mes</div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-calendar-check" />
          </div>
          <div className="card-label">Turnos del Día</div>
          <div className="card-amount">24</div>
          <div className="card-trend neutral">+8 que ayer</div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-clock" />
          </div>
          <div className="card-label">Turnos Pendientes</div>
          <div className="card-amount">156</div>
          <div className="card-trend warning">Próximos 7 días</div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-user-md" />
          </div>
          <div className="card-label">Doctores Activos</div>
          <div className="card-amount">8</div>
          <div className="card-trend positive">4 disponibles</div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Turnos del Mes</h3>
            <i className="fas fa-calendar-alt" />
          </div>
          <div className="stat-value">342</div>
          <div className="stat-details">
            <span className="stat-item">
              <i className="fas fa-check-circle" /> 298 completados
            </span>
            <span className="stat-item">
              <i className="fas fa-times-circle" /> 44 cancelados
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Nuevos Pacientes</h3>
            <i className="fas fa-user-plus" />
          </div>
          <div className="stat-value">47</div>
          <div className="stat-details">
            <span className="stat-item">
              <i className="fas fa-arrow-up" /> +8% vs mes anterior
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Tasa de Asistencia</h3>
            <i className="fas fa-chart-line" />
          </div>
          <div className="stat-value">87%</div>
          <div className="stat-details">
            <span className="stat-item">
              <i className="fas fa-info-circle" /> Promedio mensual
            </span>
          </div>
        </div>
      </div>

      <div className="transactions-grid">
        <div className="transaction-section">
          <div className="section-header">
            <h2 className="section-title">Próximos Turnos Hoy</h2>
            <button
              className="view-all-btn"
              type="button"
              onClick={() => {
                navigate("/turnos");
              }}
            >
              Ver todos
            </button>
          </div>

          <div className="transaction-list">
            <div className="transaction-item">
              <div className="transaction-icon">
                <i className="fas fa-user-circle" />
              </div>
              <div className="transaction-details">
                <div className="transaction-name">María González</div>
                <div className="transaction-meta">
                  <span className="transaction-time">
                    <i className="fas fa-clock" /> 13:30
                  </span>
                  <span className="transaction-doctor">
                    <i className="fas fa-user-md" /> Dra. Ana Solis
                  </span>
                </div>
              </div>
              <div className="transaction-status pending">Pendiente</div>
            </div>

            <div className="transaction-item">
              <div className="transaction-icon">
                <i className="fas fa-user-circle" />
              </div>
              <div className="transaction-details">
                <div className="transaction-name">Carlos Martínez</div>
                <div className="transaction-meta">
                  <span className="transaction-time">
                    <i className="fas fa-clock" /> 14:00
                  </span>
                  <span className="transaction-doctor">
                    <i className="fas fa-user-md" /> Dr. Roberto López
                  </span>
                </div>
              </div>
              <div className="transaction-status pending">Pendiente</div>
            </div>

            <div className="transaction-item">
              <div className="transaction-icon">
                <i className="fas fa-user-circle" />
              </div>
              <div className="transaction-details">
                <div className="transaction-name">Laura Benítez</div>
                <div className="transaction-meta">
                  <span className="transaction-time">
                    <i className="fas fa-clock" /> 14:30
                  </span>
                  <span className="transaction-doctor">
                    <i className="fas fa-user-md" /> Dra. Ana Solis
                  </span>
                </div>
              </div>
              <div className="transaction-status pending">Pendiente</div>
            </div>

            <div className="transaction-item">
              <div className="transaction-icon">
                <i className="fas fa-user-circle" />
              </div>
              <div className="transaction-details">
                <div className="transaction-name">Pedro Ramírez</div>
                <div className="transaction-meta">
                  <span className="transaction-time">
                    <i className="fas fa-clock" /> 15:00
                  </span>
                  <span className="transaction-doctor">
                    <i className="fas fa-user-md" /> Dr. Roberto López
                  </span>
                </div>
              </div>
              <div className="transaction-status pending">Pendiente</div>
            </div>

            <div className="transaction-item">
              <div className="transaction-icon">
                <i className="fas fa-user-circle" />
              </div>
              <div className="transaction-details">
                <div className="transaction-name">Ana Castro</div>
                <div className="transaction-meta">
                  <span className="transaction-time">
                    <i className="fas fa-clock" /> 15:30
                  </span>
                  <span className="transaction-doctor">
                    <i className="fas fa-user-md" /> Dra. María Fernández
                  </span>
                </div>
              </div>
              <div className="transaction-status pending">Pendiente</div>
            </div>
          </div>
        </div>

        <div className="transaction-section">
          <div className="section-header">
            <h2 className="section-title">Turnos Completados Hoy</h2>
            <button
              className="view-all-btn"
              type="button"
              onClick={() => {
                navigate("/turnos");
              }}
            >
              Ver todos
            </button>
          </div>

          <div className="transaction-list">
            <div className="transaction-item">
              <div className="transaction-icon">
                <i className="fas fa-user-circle" />
              </div>
              <div className="transaction-details">
                <div className="transaction-name">Roberto Villalba</div>
                <div className="transaction-meta">
                  <span className="transaction-time">
                    <i className="fas fa-clock" /> 12:30
                  </span>
                  <span className="transaction-doctor">
                    <i className="fas fa-user-md" /> Dra. Ana Solis
                  </span>
                </div>
              </div>
              <div className="transaction-status completed">Completado</div>
            </div>

            <div className="transaction-item">
              <div className="transaction-icon">
                <i className="fas fa-user-circle" />
              </div>
              <div className="transaction-details">
                <div className="transaction-name">Claudia Rojas</div>
                <div className="transaction-meta">
                  <span className="transaction-time">
                    <i className="fas fa-clock" /> 11:30
                  </span>
                  <span className="transaction-doctor">
                    <i className="fas fa-user-md" /> Dr. Roberto López
                  </span>
                </div>
              </div>
              <div className="transaction-status completed">Completado</div>
            </div>

            <div className="transaction-item">
              <div className="transaction-icon">
                <i className="fas fa-user-circle" />
              </div>
              <div className="transaction-details">
                <div className="transaction-name">Jorge Duarte</div>
                <div className="transaction-meta">
                  <span className="transaction-time">
                    <i className="fas fa-clock" /> 10:30
                  </span>
                  <span className="transaction-doctor">
                    <i className="fas fa-user-md" /> Dra. María Fernández
                  </span>
                </div>
              </div>
              <div className="transaction-status completed">Completado</div>
            </div>

            <div className="transaction-item">
              <div className="transaction-icon">
                <i className="fas fa-user-circle" />
              </div>
              <div className="transaction-details">
                <div className="transaction-name">Patricia Núñez</div>
                <div className="transaction-meta">
                  <span className="transaction-time">
                    <i className="fas fa-clock" /> 10:00
                  </span>
                  <span className="transaction-doctor">
                    <i className="fas fa-user-md" /> Dra. Ana Solis
                  </span>
                </div>
              </div>
              <div className="transaction-status completed">Completado</div>
            </div>

            <div className="transaction-item">
              <div className="transaction-icon">
                <i className="fas fa-user-circle" />
              </div>
              <div className="transaction-details">
                <div className="transaction-name">Fernando Acosta</div>
                <div className="transaction-meta">
                  <span className="transaction-time">
                    <i className="fas fa-clock" /> 09:00
                  </span>
                  <span className="transaction-doctor">
                    <i className="fas fa-user-md" /> Dr. Roberto López
                  </span>
                </div>
              </div>
              <div className="transaction-status completed">Completado</div>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-patients-section">
        <div className="section-header">
          <h2 className="section-title">Pacientes Recientes</h2>
          <button
            className="view-all-btn"
            type="button"
            onClick={() => {
              navigate("/pacientes");
            }}
          >
            Ver todos
          </button>
        </div>

        <div className="patients-grid">
          <div className="patient-card">
            <div className="patient-avatar">
              <i className="fas fa-user" />
            </div>
            <div className="patient-info">
              <h4>Mónica Vera</h4>
              <p className="patient-detail">
                <i className="fas fa-phone" /> 0981-234-567
              </p>
              <p className="patient-detail">
                <i className="fas fa-calendar" /> Último turno: 28/01/2026
              </p>
            </div>
            <button className="patient-action-btn">
              <i className="fas fa-eye" />
            </button>
          </div>

          <div className="patient-card">
            <div className="patient-avatar">
              <i className="fas fa-user" />
            </div>
            <div className="patient-info">
              <h4>Gustavo Prieto</h4>
              <p className="patient-detail">
                <i className="fas fa-phone" /> 0982-345-678
              </p>
              <p className="patient-detail">
                <i className="fas fa-calendar" /> Último turno: 27/01/2026
              </p>
            </div>
            <button className="patient-action-btn">
              <i className="fas fa-eye" />
            </button>
          </div>

          <div className="patient-card">
            <div className="patient-avatar">
              <i className="fas fa-user" />
            </div>
            <div className="patient-info">
              <h4>Silvia Ortiz</h4>
              <p className="patient-detail">
                <i className="fas fa-phone" /> 0983-456-789
              </p>
              <p className="patient-detail">
                <i className="fas fa-calendar" /> Último turno: 26/01/2026
              </p>
            </div>
            <button className="patient-action-btn">
              <i className="fas fa-eye" />
            </button>
          </div>

          <div className="patient-card">
            <div className="patient-avatar">
              <i className="fas fa-user" />
            </div>
            <div className="patient-info">
              <h4>Ricardo Medina</h4>
              <p className="patient-detail">
                <i className="fas fa-phone" /> 0984-567-890
              </p>
              <p className="patient-detail">
                <i className="fas fa-calendar" /> Último turno: 25/01/2026
              </p>
            </div>
            <button className="patient-action-btn">
              <i className="fas fa-eye" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
