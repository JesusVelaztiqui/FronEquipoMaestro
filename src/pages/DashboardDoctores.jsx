import { useState, useEffect } from "react";
import { sendData } from "../services/api";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { listarDashboardDoctor, listarTurnos } from "../services/urls";
import { useNavigate } from "react-router-dom";

const formatHora = (hora) => (hora ? hora.substring(0, 5) : "");

const DahsboardDoctores = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuarioMaestro") || "{}");

  const [datos, setDatos] = useState({
    atendidosHoy: 0,
    atendidosMes: 0,
    atendidosAnio: 0,
    tasaAsistencia: 0,
  });
  const [turnos, setTurnos] = useState([]);

  const getDatos = async () => {
    try {
      cargarLoader();
      const response = await sendData(
        `${listarDashboardDoctor}?id=${usuario?.id}`,
        "GET",
        null,
        null,
      );
      if (response?.status === 200) {
        setDatos(response?.data);
      } else {
        addToast({ type: "error", title: "Error", message: response?.mensaje, duration: 3000 });
      }
    } catch (error) {
      navigate("/login");
      addToast({ type: "error", title: "Error", message: error, duration: 3000 });
    } finally {
      ocultarLoader();
    }
  };

  const getTurnos = async () => {
    try {
      cargarLoader();
      const response = await sendData(
        listarTurnos,
        "GET",
        `?rol=${usuario?.role}&id=${usuario?.id}`,
        null,
      );
      if (response?.status === 200) {
        setTurnos(response?.data || []);
      } else {
        addToast({ type: "error", title: "Error", message: response?.mensaje, duration: 3000 });
      }
    } catch (error) {
      navigate("/login");
      addToast({ type: "error", title: "Error", message: error, duration: 3000 });
    } finally {
      ocultarLoader();
    }
  };

  useEffect(() => {
    getDatos();
    getTurnos();
  }, []);

  const hoy = new Date().toISOString().split("T")[0];
  const mesActual = new Date().getMonth();
  const anioActual = new Date().getFullYear();

  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  const turnosPendientes = turnos.filter(
    (t) => t.fecha === hoy && t.estado === "Confirmado",
  );
  const turnosAtendidosHoy = turnos.filter(
    (t) => t.fecha === hoy && t.estado === "Atendido",
  );

  const tasaColor =
    datos.tasaAsistencia >= 80
      ? "#22c55e"
      : datos.tasaAsistencia >= 50
      ? "#f59e0b"
      : "#ef4444";

  return (
    <>
      <header className="header">
        <div className="header-title">
          <p>Bienvenido al Equipo Maestro</p>
          <h1>
            {usuario?.nombre} {usuario?.apellido}
          </h1>
        </div>
      </header>

      <div className="cards-grid">
        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-user-check" />
          </div>
          <div className="card-label">Pacientes atendidos hoy</div>
          <div className="card-amount">{datos.atendidosHoy}</div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>
            {new Date().toLocaleDateString("es-PY", { day: "2-digit", month: "long" })}
          </div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-calendar-check" />
          </div>
          <div className="card-label">Pacientes atendidos en el mes</div>
          <div className="card-amount">{datos.atendidosMes}</div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>
            {MESES[mesActual]} {anioActual}
          </div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-chart-line" />
          </div>
          <div className="card-label">Pacientes atendidos en el año</div>
          <div className="card-amount">{datos.atendidosAnio}</div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>
            {anioActual}
          </div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-percentage" style={{ color: tasaColor }} />
          </div>
          <div className="card-label">Tasa de asistencia del mes</div>
          <div className="card-amount" style={{ color: tasaColor }}>
            {datos.tasaAsistencia}%
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>
            Atendidos vs cancelados — {MESES[mesActual]}
          </div>
        </div>
      </div>

      <div className="transactions-grid">
        <div className="transaction-section">
          <h2 className="section-title">Turnos pendientes hoy</h2>
          {turnosPendientes.length > 0 ? (
            turnosPendientes.map((t) => (
              <div className="transaction-item" key={t.id}>
                <div className="transaction-icon">
                  <i className="fas fa-user" />
                </div>
                <div className="transaction-details">
                  <div className="transaction-name">{t.paciente}</div>
                  <div className="transaction-time">
                    {formatHora(t.hora)}
                    {t.consultorio && (
                      <span style={{ marginLeft: 8 }}>
                        <i className="fas fa-door-open" /> Consultorio {t.consultorio}
                      </span>
                    )}
                  </div>
                </div>
                <div className="transaction-status pending">{t.estado}</div>
              </div>
            ))
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Sin turnos pendientes para hoy</p>
          )}
        </div>

        <div className="transaction-section">
          <h2 className="section-title">Pacientes atendidos hoy</h2>
          {turnosAtendidosHoy.length > 0 ? (
            turnosAtendidosHoy.map((t) => (
              <div className="transaction-item" key={t.id}>
                <div className="transaction-icon">
                  <i className="fas fa-user" />
                </div>
                <div className="transaction-details">
                  <div className="transaction-name">{t.paciente}</div>
                  <div className="transaction-time">
                    {formatHora(t.hora)}
                    {t.consultorio && (
                      <span style={{ marginLeft: 8 }}>
                        <i className="fas fa-door-open" /> Consultorio {t.consultorio}
                      </span>
                    )}
                  </div>
                </div>
                <div className="transaction-status completed">Atendido</div>
              </div>
            ))
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Sin pacientes atendidos hoy</p>
          )}
        </div>
      </div>
    </>
  );
};

export default DahsboardDoctores;
