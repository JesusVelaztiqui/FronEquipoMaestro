import { useEffect, useState } from "react";
import useUserStore from "../features/auth/zustandUser";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { useNavigate } from "react-router-dom";
import { sendData } from "../services/api";
import { dahsboardAdmin } from "../services/urls";
import { addToast } from "../components/Tooltip";
import { formatoFecha } from "../components/Formatos";

const AdminDashboard = () => {
  const { user, loadUser } = useUserStore();
  const navigate = useNavigate();
  const [dash, setDash] = useState({});
  const getData = async () => {
    try {
      cargarLoader();
      const response = await sendData(dahsboardAdmin, "GET", null, null);
      if (response.status === 200) {
        setDash(response.data);
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: response?.mensaje,
          duration: 3000,
        });
      }
    } catch (error) {
      navigate("/login");
      addToast({
        type: "error",
        title: "Error",
        message: error,
        duration: 3000,
      });
    } finally {
      ocultarLoader();
    }
  };

  useEffect(() => {
    loadUser();
    getData();
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
          <div className="card-amount">{dash?.totalpaciente}</div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-calendar-check" />
          </div>
          <div className="card-label">Turnos del Día</div>
          <div className="card-amount">{dash?.turnodia}</div>
          <div className="card-trend neutral">
            {dash?.turnodia - dash?.turnosayer > 0
              ? `+${dash?.turnodia - dash?.turnosayer} que ayer`
              : dash?.turnodia - dash?.turnosayer < 0
                ? `${dash?.turnodia - dash?.turnosayer} que ayer`
                : "Igual que ayer"}
          </div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-clock" />
          </div>
          <div className="card-label">Turnos Pendientes</div>
          <div className="card-amount">{dash?.turnopendiente}</div>
          <div className="card-trend warning">Próximos 7 días</div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-user-md" />
          </div>
          <div className="card-label">Total Doctores</div>
          <div className="card-amount">{dash?.totaldoctores}</div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Turnos del Mes</h3>
            <i className="fas fa-calendar-alt" />
          </div>
          <div className="stat-value">{dash?.turnosmes}</div>
          <div className="stat-details">
            <span className="stat-item">
              <i className="fas fa-check-circle" /> {dash?.turnoscompletos}{" "}
              completados
            </span>
            <span className="stat-item">
              <i className="fas fa-times-circle" /> {dash?.turnoscanelados}{" "}
              cancelados
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Nuevos Pacientes</h3>
            <i className="fas fa-user-plus" />
          </div>
          <div className="stat-value">{dash?.pacientemes}</div>
          <div className="stat-details">
            <span className="stat-item">
              {dash &&
              dash.pacientemes != null &&
              dash.pacientemespasado != null ? (
                <>
                  {dash.pacientemes > dash.pacientemespasado && (
                    <>
                      <i className="fas fa-arrow-up" />{" "}
                      {dash.pacientemes - dash.pacientemespasado} más que el mes
                      anterior
                    </>
                  )}
                  {dash.pacientemes < dash.pacientemespasado && (
                    <>
                      <i className="fas fa-arrow-down" />{" "}
                      {dash.pacientemespasado - dash.pacientemes} menos que el
                      mes anterior
                    </>
                  )}
                  {dash.pacientemes === dash.pacientemespasado && (
                    <>
                      <i className="fas fa-minus" /> 0 Igual que el mes anterior
                    </>
                  )}
                </>
              ) : (
                <>Sin datos</>
              )}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Tasa de Asistencia</h3>
            <i className="fas fa-chart-line" />
          </div>
          <div className="stat-value">{dash?.asistencia}%</div>
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
            {dash?.turnos
              ?.filter((e) => e.estado === "PENDIENTE")
              ?.map((t) => (
                <div className="transaction-item" key={t.id}>
                  <div className="transaction-icon">
                    <i className="fas fa-user-circle" />
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-name">{t.paciente}</div>
                    <div className="transaction-meta">
                      <span className="transaction-time">
                        <i className="fas fa-clock" /> {t.hora}
                      </span>
                      <span className="transaction-doctor">
                        <i className="fas fa-user-md" /> {t.doctor}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-status pending">{t.estado}</div>
                </div>
              ))}
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
            {dash?.turnos
              ?.filter((e) => e.estado === "CONFIRMADO")
              ?.map((t) => (
                <div className="transaction-item" key={t.id}>
                  <div className="transaction-icon">
                    <i className="fas fa-user-circle" />
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-name">{t.paciente}</div>
                    <div className="transaction-meta">
                      <span className="transaction-time">
                        <i className="fas fa-clock" /> {t.hora}
                      </span>
                      <span className="transaction-doctor">
                        <i className="fas fa-user-md" /> {t.doctor}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-status completed">{t.estado}</div>
                </div>
              ))}
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
        {dash?.pacienteList?.length > 0 ? (
          <div className="patients-grid">
            {dash?.pacienteList?.map((p) => (
              <div className="patient-card">
                <div className="patient-avatar">
                  <i className="fas fa-user" />
                </div>
                <div className="patient-info">
                  <h4>
                    {p.nombre} {p.apellido}
                  </h4>
                  <p className="patient-detail">
                    <i className="fas fa-phone" /> {p.celular}
                  </p>
                  <p className="patient-detail">
                    <i className="fas fa-calendar" /> Último turno:
                    {formatoFecha(p.fecha, "dd/MM/yyyy")}
                  </p>
                  <p className="patient-detail">
                    <i className="far fa-clock" /> a las {p.hora}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
