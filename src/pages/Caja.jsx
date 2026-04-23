import { useState, useEffect, useCallback } from "react";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { sendData } from "../services/api";
import { listarCaja, detalleCaja } from "../services/urls";
import { useNavigate } from "react-router-dom";

const formatGs = (valor) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const Caja = () => {
  const navigate = useNavigate();
  const usuario  = JSON.parse(localStorage.getItem("usuarioMaestro") || "{}");
  const doctorId = usuario?.id;

  const [data, setData] = useState({
    totalBruto: 0, insumos: 0, totalLaboratorio: 0,
    gananciaMensual: 0, gananciaAnual: 0,
    nombre: "", apellido: "", meses: [],
  });

  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroMes,  setFiltroMes]  = useState("");

  const [modal, setModal] = useState({ open: false, label: "", anio: 0, mes: 0, ganancia: 0, detalle: [] });

  const getCaja = useCallback(async () => {
    if (!doctorId) return;
    try {
      cargarLoader();
      const res = await sendData(`${listarCaja}?doctorId=${doctorId}`, "GET", null, null);
      if (res?.status === 200) {
        setData(res.data);
      } else {
        addToast({ type: "error", title: "Error", message: res?.mensaje, duration: 3000 });
      }
    } catch {
      navigate("/login");
    } finally {
      ocultarLoader();
    }
  }, [doctorId, navigate]);

  useEffect(() => { getCaja(); }, [getCaja]);

  const abrirDetalle = async (item) => {
    try {
      cargarLoader();
      const res = await sendData(
        `${detalleCaja}?doctorId=${doctorId}&anio=${item.anio}&mes=${item.mes}`,
        "GET", null, null
      );
      if (res?.status === 200) {
        setModal({ open: true, label: item.label, anio: item.anio, mes: item.mes, ganancia: item.ganancia, detalle: res.data });
      }
    } catch {
      addToast({ type: "error", title: "Error", message: "No se pudo cargar el detalle.", duration: 3000 });
    } finally {
      ocultarLoader();
    }
  };

  const nombreCompleto = `${data.nombre} ${data.apellido}`.trim();

  // Opciones únicas para los filtros
  const aniosDisponibles = [...new Set(data.meses.map((m) => m.anio))].sort((a, b) => b - a);
  const mesesDisponibles = [...new Set(
    data.meses
      .filter((m) => !filtroAnio || m.anio === Number(filtroAnio))
      .map((m) => m.mes)
  )].sort((a, b) => a - b);

  const mesesFiltrados = data.meses.filter((m) => {
    if (filtroAnio && m.anio !== Number(filtroAnio)) return false;
    if (filtroMes  && m.mes  !== Number(filtroMes))  return false;
    return true;
  });

  const MESES_ES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const mesActual = new Date().toLocaleString("es-PY", { month: "long", year: "numeric" });

  return (
    <>
      <div className="caja-page">
        <div className="caja-header">
          <div>
            <h1 className="caja-header__title">Caja</h1>
            <p className="caja-header__subtitle">{nombreCompleto}</p>
          </div>
        </div>

        {/* 4 summary cards */}
        <div className="caja-summary caja-summary--4">
          <div className="caja-summary-card">
            <div className="caja-summary-card__icon caja-summary-card__icon--total">
              <i className="fas fa-file-invoice-dollar" />
            </div>
            <div>
              <p className="caja-summary-card__label">Total Bruto (mes actual)</p>
              <p className="caja-summary-card__value">{formatGs(data.totalBruto)}</p>
            </div>
          </div>

          <div className="caja-summary-card">
            <div className="caja-summary-card__icon caja-summary-card__icon--pendiente">
              <i className="fas fa-building" />
            </div>
            <div>
              <p className="caja-summary-card__label">Equipo Maestro — Caja-Insumos</p>
              <p className="caja-summary-card__value">{formatGs(data.insumos)}</p>
              {data.totalLaboratorio > 0 && (
                <p className="caja-summary-card__sub">Laboratorio: {formatGs(data.totalLaboratorio)}</p>
              )}
            </div>
          </div>

          <div className="caja-summary-card">
            <div className="caja-summary-card__icon caja-summary-card__icon--cobrado">
              <i className="fas fa-calendar-alt" />
            </div>
            <div>
              <p className="caja-summary-card__label">Ganancia Anual {new Date().getFullYear()}</p>
              <p className="caja-summary-card__value">{formatGs(data.gananciaAnual)}</p>
            </div>
          </div>

          <div className="caja-summary-card">
            <div className="caja-summary-card__icon" style={{ background: "#d1fae5", color: "#065f46" }}>
              <i className="fas fa-user-doctor" />
            </div>
            <div>
              <p className="caja-summary-card__label">{nombreCompleto || "Doctor"}</p>
              <p className="caja-summary-card__value">{formatGs(data.gananciaMensual)}</p>
              <p className="caja-summary-card__sub">
                {mesActual.charAt(0).toUpperCase() + mesActual.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="caja-filtros">
          <select
            className="caja-select"
            value={filtroAnio}
            onChange={(e) => { setFiltroAnio(e.target.value); setFiltroMes(""); }}
          >
            <option value="">Todos los años</option>
            {aniosDisponibles.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            className="caja-select"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            <option value="">Todos los meses</option>
            {mesesDisponibles.map((m) => (
              <option key={m} value={m}>{MESES_ES[m]}</option>
            ))}
          </select>
        </div>

        {/* Grid de meses */}
        <div className="caja-grid">
          {mesesFiltrados.length > 0 ? (
            mesesFiltrados.map((item, i) => (
              <div
                key={i}
                className="caja-card caja-card--clickable"
                onClick={() => abrirDetalle(item)}
                title="Ver desglose diario"
              >
                <div className="caja-card__header">
                  <div className="caja-card__avatar">
                    <i className="fas fa-calendar-check" />
                  </div>
                  <div className="caja-card__info">
                    <p className="caja-card__nombre">{nombreCompleto}</p>
                    <p className="caja-card__periodo">{item.label}</p>
                  </div>
                  <i className="fas fa-eye" style={{ color: "#9ca3af", fontSize: 14 }} />
                </div>
                <div className="caja-card__body">
                  <div className="caja-card__row">
                    <span className="caja-card__row-label">Ganancia neta</span>
                    <span className="caja-card__row-value caja-card__row-value--deuda">
                      {formatGs(item.ganancia)}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                    Click para ver desglose diario
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="caja-empty">
              <i className="fa-solid fa-file-circle-exclamation" />
              <p>Sin registros para el período seleccionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal detalle diario */}
      <div className="modal-overlay" style={{ display: modal.open ? "flex" : "none" }}>
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">
              {nombreCompleto} — {modal.label}
            </h2>
            <button className="modal-close" onClick={() => setModal((p) => ({ ...p, open: false }))}>
              &times;
            </button>
          </div>

          <div className="modal-body">
            {modal.detalle.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>
                      Fecha
                    </th>
                    <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>
                      Ganancia
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {modal.detalle.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 12px", color: "#374151" }}>
                        <i className="fas fa-calendar-day" style={{ marginRight: 8, color: "#9ca3af" }} />
                        {item.fecha}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "rgb(160,100,20)" }}>
                        {formatGs(item.ganancia)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#374151", borderTop: "2px solid #e5e7eb" }}>
                      Total
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "rgb(160,100,20)", borderTop: "2px solid #e5e7eb" }}>
                      {formatGs(modal.ganancia)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="caja-empty">
                <i className="fa-solid fa-file-circle-exclamation" />
                <p>Sin movimientos en este mes</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setModal((p) => ({ ...p, open: false }))}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Caja;
