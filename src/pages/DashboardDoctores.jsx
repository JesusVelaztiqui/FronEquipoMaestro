import { useState, useEffect } from "react";
import { sendData } from "../services/api";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { listarDashboardDoctor, listarTurnos } from "../services/urls";
import { useNavigate } from "react-router-dom";

const formatGuarani = (valor) => "₲ " + Number(valor).toLocaleString("es-PY");
const formatHora = (hora) => (hora ? hora.substring(0, 5) : "");

const DahsboardDoctores = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuarioMaestro") || "{}");
  const mesActual = new Date().getMonth() + 1;

  const [datos, setDatos] = useState({
    ingresoMes: 0,
    egresoMes: 0,
    ingresoAnual: 0,
    egresoAnual: 0,
  });
  const [turnos, setTurnos] = useState([]);

  const getDatos = async () => {
    try {
      cargarLoader();
      const response = await sendData(
        `${listarDashboardDoctor}?mes=${mesActual}&id=${usuario?.id}`,
        "GET",
        null,
        null,
      );
      if (response?.status === 200) {
        setDatos(response?.data);
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
    getDatos();
    getTurnos();
  }, []);

  const hoy = new Date().toISOString().split("T")[0];
  const turnosPendientes = turnos.filter(
    (t) => t.estado !== "Confirmado" && t.estado !== "Cancelado",
  );
  const turnosAtendidos = turnos.filter(
    (t) => t.fecha === hoy && t.estado === "Confirmado",
  );

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
            <i className="fas fa-credit-card" />
          </div>
          <div className="card-label">Total de Ingresos mensual</div>
          <div className="card-amount">{formatGuarani(datos.ingresoMes)}</div>
        </div>
        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-upload" />
          </div>
          <div className="card-label">Total Egreso mensual</div>
          <div className="card-amount">{formatGuarani(datos.egresoMes)}</div>
        </div>
        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-building" />
          </div>
          <div className="card-label">Total Ingreso Anual</div>
          <div className="card-amount">{formatGuarani(datos.ingresoAnual)}</div>
        </div>
        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-building" />
          </div>
          <div className="card-label">Total Egreso Anual</div>
          <div className="card-amount">{formatGuarani(datos.egresoAnual)}</div>
        </div>
      </div>

      <div className="transactions-grid">
        <div className="transaction-section">
          <h2 className="section-title">Siguientes Turnos hoy</h2>
          {turnosPendientes.length > 0
            ? turnosPendientes.map((t) => (
                <div className="transaction-item" key={t.id}>
                  <div className="transaction-icon">
                    <i className="fas fa-user" />
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-name">{t.paciente}</div>
                    <div className="transaction-time">
                      hoy, {formatHora(t.hora)}
                    </div>
                  </div>
                  <div className="transaction-status pending">{t.estado}</div>
                </div>
              ))
            : ""}
        </div>

        <div className="transaction-section">
          <h2 className="section-title">Pacientes Atendidos Hoy</h2>
          {turnosAtendidos.length > 0
            ? turnosAtendidos.map((t) => (
                <div className="transaction-item" key={t.id}>
                  <div className="transaction-icon">
                    <i className="fas fa-user" />
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-name">{t.paciente}</div>
                    <div className="transaction-time">
                      hoy, {formatHora(t.hora)}
                    </div>
                  </div>
                  <div className="transaction-status completed">Completado</div>
                </div>
              ))
            : ""}
        </div>
      </div>
    </>
  );
};

export default DahsboardDoctores;
