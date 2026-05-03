import { useState, useEffect, useCallback } from "react";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { sendData } from "../services/api";
import { listarCaja, detalleCaja, insumosHistorialCaja, laboratorioHistorialCaja, resumenPeriodoCaja } from "../services/urls";
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
    nombre: "", apellido: "",
    laboratorioDia: 0, laboratorioAnual: 0,
    meses: [],
  });

  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroMes,  setFiltroMes]  = useState("");
  const [periodo, setPeriodo] = useState(null);

  const [modal, setModal] = useState({ open: false, label: "", anio: 0, mes: 0, ganancia: 0, detalle: [] });
  const [modalInsumos, setModalInsumos] = useState({ open: false, historial: [] });
  const [modalLab, setModalLab] = useState({ open: false, historial: [] });

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

  useEffect(() => { getCaja(); fetchPeriodo("", ""); }, [getCaja]);

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

  const abrirInsumosHistorial = async () => {
    try {
      cargarLoader();
      const res = await sendData(insumosHistorialCaja, "GET", null, null);
      if (res?.status === 200) {
        setModalInsumos({ open: true, historial: res.data });
      }
    } catch {
      addToast({ type: "error", title: "Error", message: "No se pudo cargar el historial.", duration: 3000 });
    } finally {
      ocultarLoader();
    }
  };

  const fetchPeriodo = async (anio, mes) => {
    const params = [`doctorId=${doctorId}`];
    if (anio) params.push(`anio=${anio}`);
    if (mes)  params.push(`mes=${mes}`);
    try {
      const res = await sendData(`${resumenPeriodoCaja}?${params.join("&")}`, "GET", null, null);
      if (res?.status === 200) setPeriodo(res.data);
    } catch { /* silencioso */ }
  };

  const abrirLaboratorioHistorial = async () => {
    try {
      cargarLoader();
      const res = await sendData(laboratorioHistorialCaja, "GET", null, null);
      if (res?.status === 200) {
        setModalLab({ open: true, historial: res.data });
      }
    } catch {
      addToast({ type: "error", title: "Error", message: "No se pudo cargar el historial de laboratorio.", duration: 3000 });
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
              <p className="caja-summary-card__label">Total Bruto</p>
              <p className="caja-summary-card__value">{formatGs(periodo?.totalBruto ?? data.totalBruto)}</p>
              <p className="caja-summary-card__sub">
                {filtroMes ? `${MESES_ES[Number(filtroMes)]} ` : ""}{filtroAnio || new Date().getFullYear()}
              </p>
            </div>
          </div>

          <div
            className="caja-summary-card"
            style={{ cursor: "pointer" }}
            onClick={abrirInsumosHistorial}
            title="Ver historial de insumos"
          >
            <div className="caja-summary-card__icon caja-summary-card__icon--pendiente">
              <i className="fas fa-building" />
            </div>
            <div>
              <p className="caja-summary-card__label">Equipo Maestro — Caja-Insumos</p>
              <p className="caja-summary-card__value">{formatGs(periodo?.insumos ?? data.insumos)}</p>
              <p className="caja-summary-card__sub">
                {filtroMes ? `${MESES_ES[Number(filtroMes)]} ` : ""}{filtroAnio || new Date().getFullYear()}
              </p>
              <p className="caja-summary-card__sub" style={{ color: "#9ca3af", marginTop: 2 }}>
                <i className="fas fa-clock-rotate-left" style={{ marginRight: 4 }} />
                Ver historial
              </p>
            </div>
          </div>

          <div className="caja-summary-card">
            <div className="caja-summary-card__icon caja-summary-card__icon--cobrado">
              <i className="fas fa-calendar-alt" />
            </div>
            <div>
              <p className="caja-summary-card__label">Ganancia Anual {filtroAnio || new Date().getFullYear()}</p>
              <p className="caja-summary-card__value">{formatGs(periodo?.gananciaAnual ?? data.gananciaAnual)}</p>
              <p className="caja-summary-card__sub">{filtroAnio || new Date().getFullYear()}</p>
            </div>
          </div>

          <div className="caja-summary-card">
            <div className="caja-summary-card__icon" style={{ background: "#d1fae5", color: "#065f46" }}>
              <i className="fas fa-user-doctor" />
            </div>
            <div>
              <p className="caja-summary-card__label">{nombreCompleto || "Doctor"}</p>
              <p className="caja-summary-card__value">{formatGs(periodo?.ganancia ?? data.gananciaMensual)}</p>
              <p className="caja-summary-card__sub">
                {filtroMes ? `${MESES_ES[Number(filtroMes)]} ` : ""}{filtroAnio || new Date().getFullYear()}
              </p>
            </div>
          </div>

          <div
            className="caja-summary-card"
            style={{ cursor: "pointer" }}
            onClick={abrirLaboratorioHistorial}
            title="Ver historial de laboratorio por día"
          >
            <div className="caja-summary-card__icon" style={{ background: "#ede9fe", color: "#5b21b6" }}>
              <i className="fas fa-flask" />
            </div>
            <div>
              <p className="caja-summary-card__label">Laboratorio</p>
              <p className="caja-summary-card__value">{formatGs(periodo?.laboratorio ?? data.totalLaboratorio)}</p>
              <p className="caja-summary-card__sub">
                {filtroMes ? `${MESES_ES[Number(filtroMes)]} ` : ""}{filtroAnio || new Date().getFullYear()}
              </p>
              <p className="caja-summary-card__sub" style={{ color: "#9ca3af", marginTop: 2 }}>
                <i className="fas fa-clock-rotate-left" style={{ marginRight: 4 }} />
                Ver historial
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="caja-filtros">
          <select
            className="caja-select"
            value={filtroAnio}
            onChange={(e) => { const a = e.target.value; setFiltroAnio(a); setFiltroMes(""); fetchPeriodo(a, ""); }}
          >
            <option value="">Todos los años</option>
            {aniosDisponibles.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            className="caja-select"
            value={filtroMes}
            onChange={(e) => { const m = e.target.value; setFiltroMes(m); fetchPeriodo(filtroAnio, m); }}
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

      {/* Modal historial insumos */}
      <div className="modal-overlay" style={{ display: modalInsumos.open ? "flex" : "none" }}>
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">
              Historial — Equipo Maestro Caja-Insumos
              {(filtroMes || filtroAnio) && (
                <span style={{ fontSize: 13, fontWeight: 400, color: "#6b7280", marginLeft: 8 }}>
                  {filtroMes ? `${MESES_ES[Number(filtroMes)]} ` : ""}{filtroAnio}
                </span>
              )}
            </h2>
            <button className="modal-close" onClick={() => setModalInsumos({ open: false, historial: [] })}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            {(() => {
              const filtrado = modalInsumos.historial.filter((item) => {
                if (filtroAnio && item.anio !== Number(filtroAnio)) return false;
                if (filtroMes  && item.mes  !== Number(filtroMes))  return false;
                return true;
              });
              return filtrado.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Período</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Insumos</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Laboratorio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrado.map((item, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 12px", color: "#374151", fontWeight: 600 }}>
                          <i className="fas fa-calendar-alt" style={{ marginRight: 8, color: "#9ca3af" }} />
                          {item.label}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "rgb(160,100,20)" }}>
                          {formatGs(item.insumos)}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#374151" }}>
                          {item.totalLaboratorio > 0 ? formatGs(item.totalLaboratorio) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "#374151", borderTop: "2px solid #e5e7eb" }}>Total</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "rgb(160,100,20)", borderTop: "2px solid #e5e7eb" }}>
                        {formatGs(filtrado.reduce((a, i) => a + i.insumos, 0))}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#374151", borderTop: "2px solid #e5e7eb" }}>
                        {formatGs(filtrado.reduce((a, i) => a + i.totalLaboratorio, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="caja-empty">
                  <i className="fa-solid fa-file-circle-exclamation" />
                  <p>Sin historial de insumos</p>
                </div>
              );
            })()}
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setModalInsumos({ open: false, historial: [] })}>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal historial laboratorio por día */}
      <div className="modal-overlay" style={{ display: modalLab.open ? "flex" : "none" }}>
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">Historial — Laboratorio por Día</h2>
            <button className="modal-close" onClick={() => setModalLab({ open: false, historial: [] })}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            {modalLab.historial.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Fecha</th>
                    <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Laboratorio</th>
                  </tr>
                </thead>
                <tbody>
                  {modalLab.historial.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 12px", color: "#374151", fontWeight: 600 }}>
                        <i className="fas fa-calendar-day" style={{ marginRight: 8, color: "#9ca3af" }} />
                        {item.fecha}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#5b21b6" }}>
                        {formatGs(item.ganancia)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#374151", borderTop: "2px solid #e5e7eb" }}>Total</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#5b21b6", borderTop: "2px solid #e5e7eb" }}>
                      {formatGs(modalLab.historial.reduce((a, i) => a + i.ganancia, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="caja-empty">
                <i className="fa-solid fa-file-circle-exclamation" />
                <p>Sin registros de laboratorio</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setModalLab({ open: false, historial: [] })}>
              Cerrar
            </button>
          </div>
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
