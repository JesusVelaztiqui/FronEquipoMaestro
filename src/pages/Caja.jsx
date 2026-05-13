import { useState, useEffect, useCallback } from "react";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { sendData } from "../services/api";
import {
  listarCaja, detalleCaja, insumosHistorialCaja, laboratorioHistorialCaja, resumenPeriodoCaja,
  cajaSoloMeses, cajaDetalleSolo, cajaCompartidoMeses, cajaDetalleCompartido,
  cajaAdminResumen, cajaAdminDetalle, cajaAdminLabDetalle, listarDoctores
} from "../services/urls";
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
  const isAdmin  = usuario?.role === "admin";

  // ── Estado admin ──
  const [adminData, setAdminData] = useState({
    totalBruto: 0, faltaCobrar: 0, totalIngresado: 0,
    totalIngresadoAnual: 0, totalLaboratorio: 0, meses: []
  });
  const [adminFiltroAnio, setAdminFiltroAnio] = useState(String(new Date().getFullYear()));
  const [adminFiltroMes,  setAdminFiltroMes]  = useState("");
  const [modalAdmin,    setModalAdmin]    = useState({ open: false, label: "", ganancia: 0, detalle: [] });
  const [modalAdminLab, setModalAdminLab] = useState({ open: false, label: "", ganancia: 0, detalle: [] });

  const [data, setData] = useState({
    totalBruto: 0, insumos: 0, totalLaboratorio: 0,
    gananciaMensual: 0, gananciaAnual: 0,
    nombre: "", apellido: "",
    laboratorioDia: 0, laboratorioAnual: 0,
    meses: [],
  });

  const [filtroAnio, setFiltroAnio] = useState(String(new Date().getFullYear()));
  const [filtroMes,  setFiltroMes]  = useState("");
  const [periodo, setPeriodo] = useState(null);

  const [modal, setModal] = useState({ open: false, label: "", anio: 0, mes: 0, ganancia: 0, detalle: [] });
  const [modalInsumos, setModalInsumos] = useState({ open: false, historial: [] });
  const [modalLab, setModalLab] = useState({ open: false, historial: [] });

  const [soloMeses, setSoloMeses] = useState([]);
  const [modalSolo, setModalSolo] = useState({ open: false, label: "", ganancia: 0, detalle: [] });

  const [listDoctores, setListDoctores] = useState([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState("");
  const [compartidoMeses, setCompartidoMeses] = useState([]);
  const [modalCompartido, setModalCompartido] = useState({ open: false, label: "", ganancia: 0, detalle: [] });

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

  const fetchAdminResumen = async (anio, mes) => {
    const params = [];
    if (anio) params.push(`anio=${anio}`);
    if (mes)  params.push(`mes=${mes}`);
    try {
      cargarLoader();
      const res = await sendData(`${cajaAdminResumen}${params.length ? "?" + params.join("&") : ""}`, "GET", null, null);
      if (res?.status === 200) setAdminData(res.data);
    } catch { /* silencioso */ } finally { ocultarLoader(); }
  };

  const abrirAdminLabDetalle = async () => {
    const a = adminFiltroAnio || new Date().getFullYear();
    const m = adminFiltroMes  || new Date().getMonth() + 1;
    const label = `${MESES_ES[Number(m)]} ${a}`;
    try {
      cargarLoader();
      const res = await sendData(`${cajaAdminLabDetalle}?anio=${a}&mes=${m}`, "GET", null, null);
      if (res?.status === 200)
        setModalAdminLab({ open: true, label, ganancia: adminData.totalLaboratorio, detalle: res.data });
    } catch {
      addToast({ type: "error", title: "Error", message: "No se pudo cargar el detalle.", duration: 3000 });
    } finally { ocultarLoader(); }
  };

  const abrirAdminDetalle = async (item) => {
    try {
      cargarLoader();
      const res = await sendData(`${cajaAdminDetalle}?anio=${item.anio}&mes=${item.mes}`, "GET", null, null);
      if (res?.status === 200)
        setModalAdmin({ open: true, label: item.label, ganancia: item.ganancia, detalle: res.data });
    } catch {
      addToast({ type: "error", title: "Error", message: "No se pudo cargar el detalle.", duration: 3000 });
    } finally { ocultarLoader(); }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminResumen(new Date().getFullYear(), "");
    } else {
      getCaja();
      fetchPeriodo(new Date().getFullYear(), "");
      fetchSoloMeses();
      fetchDoctores();
    }
  }, [getCaja, isAdmin]);

  const fetchDoctores = async () => {
    try {
      const res = await sendData(listarDoctores, "GET", null, null);
      if (res?.status === 200)
        setListDoctores((res.data || []).filter((d) => d.id !== doctorId));
    } catch { /* silencioso */ }
  };

  const fetchSoloMeses = async () => {
    try {
      const res = await sendData(`${cajaSoloMeses}?doctorId=${doctorId}`, "GET", null, null);
      if (res?.status === 200) setSoloMeses(res.data || []);
    } catch { /* silencioso */ }
  };

  const fetchCompartidoMeses = async (d2Id) => {
    if (!d2Id) { setCompartidoMeses([]); return; }
    try {
      const res = await sendData(`${cajaCompartidoMeses}?doctorId=${doctorId}&doctor2Id=${d2Id}`, "GET", null, null);
      if (res?.status === 200) setCompartidoMeses(res.data || []);
    } catch { /* silencioso */ }
  };

  const abrirDetalleSolo = async (item) => {
    try {
      cargarLoader();
      const res = await sendData(`${cajaDetalleSolo}?doctorId=${doctorId}&anio=${item.anio}&mes=${item.mes}`, "GET", null, null);
      if (res?.status === 200)
        setModalSolo({ open: true, label: item.label, ganancia: item.ganancia, detalle: res.data });
    } catch {
      addToast({ type: "error", title: "Error", message: "No se pudo cargar el detalle.", duration: 3000 });
    } finally { ocultarLoader(); }
  };

  const abrirDetalleCompartido = async (item) => {
    if (!doctorSeleccionado) return;
    try {
      cargarLoader();
      const res = await sendData(
        `${cajaDetalleCompartido}?doctorId=${doctorId}&doctor2Id=${doctorSeleccionado}&anio=${item.anio}&mes=${item.mes}`,
        "GET", null, null
      );
      if (res?.status === 200)
        setModalCompartido({ open: true, label: item.label, ganancia: item.ganancia, detalle: res.data });
    } catch {
      addToast({ type: "error", title: "Error", message: "No se pudo cargar el detalle.", duration: 3000 });
    } finally { ocultarLoader(); }
  };

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

  const soloFiltrados = soloMeses.filter((m) => {
    if (filtroAnio && m.anio !== Number(filtroAnio)) return false;
    if (filtroMes  && m.mes  !== Number(filtroMes))  return false;
    return true;
  });
  const totalSolo = soloFiltrados.reduce((acc, m) => acc + m.ganancia, 0);

  const compartidoFiltrados = compartidoMeses.filter((m) => {
    if (filtroAnio && m.anio !== Number(filtroAnio)) return false;
    if (filtroMes  && m.mes  !== Number(filtroMes))  return false;
    return true;
  });
  const totalCompartido = compartidoFiltrados.reduce((acc, m) => acc + m.ganancia, 0);

  const mesesFiltrados = data.meses.filter((m) => {
    if (filtroAnio && m.anio !== Number(filtroAnio)) return false;
    if (filtroMes  && m.mes  !== Number(filtroMes))  return false;
    return true;
  });
  const totalGeneral = mesesFiltrados.reduce((acc, m) => acc + m.ganancia, 0);

  const MESES_ES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Derivados admin
  const adminAniosDisponibles = [...new Set(adminData.meses.map((m) => m.anio))].sort((a, b) => b - a);
  const adminMesesDisponibles = [...new Set(
    adminData.meses
      .filter((m) => !adminFiltroAnio || m.anio === Number(adminFiltroAnio))
      .map((m) => m.mes)
  )].sort((a, b) => a - b);
  const adminMesesFiltrados = adminData.meses.filter((m) => {
    if (adminFiltroAnio && m.anio !== Number(adminFiltroAnio)) return false;
    if (adminFiltroMes  && m.mes  !== Number(adminFiltroMes))  return false;
    return true;
  });
  const adminTotalFiltrado = adminMesesFiltrados.reduce((acc, m) => acc + m.ganancia, 0);

  // ── Vista Admin ──────────────────────────────────────────────────────────────
  if (isAdmin) {
    const anioLabel = adminFiltroMes
      ? `${MESES_ES[Number(adminFiltroMes)]} ${adminFiltroAnio || new Date().getFullYear()}`
      : adminFiltroAnio || new Date().getFullYear();

    return (
      <>
        <div className="caja-page">
          {/* Header + Filtros */}
          <div className="caja-header" style={{ alignItems: "center" }}>
            <div>
              <h1 className="caja-header__title">Caja — Administración</h1>
              <p className="caja-header__subtitle">Vista global de todos los ingresos</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <select className="caja-select" value={adminFiltroAnio}
                onChange={(e) => { const a = e.target.value; setAdminFiltroAnio(a); setAdminFiltroMes(""); fetchAdminResumen(a, ""); }}>
                {adminAniosDisponibles.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select className="caja-select" value={adminFiltroMes}
                onChange={(e) => { const m = e.target.value; setAdminFiltroMes(m); fetchAdminResumen(adminFiltroAnio, m); }}>
                <option value="">Todos los meses</option>
                {adminMesesDisponibles.map((m) => <option key={m} value={m}>{MESES_ES[m]}</option>)}
              </select>
            </div>
          </div>

          {/* 4 KPI cards admin */}
          <div className="caja-summary caja-summary--4">
            <div className="caja-summary-card">
              <div className="caja-summary-card__icon caja-summary-card__icon--total">
                <i className="fas fa-file-invoice-dollar" />
              </div>
              <div>
                <p className="caja-summary-card__label">Total Bruto (tratamientos)</p>
                <p className="caja-summary-card__value">{formatGs(adminData.totalBruto)}</p>
                <p className="caja-summary-card__sub">{adminFiltroAnio || new Date().getFullYear()}</p>
                <p className="caja-summary-card__sub" style={{ color: "#9ca3af", marginTop: 2, fontSize: 11 }}>
                  Calculado por año
                </p>
              </div>
            </div>

            <div className="caja-summary-card">
              <div className="caja-summary-card__icon" style={{ background: "#fee2e2", color: "#b91c1c" }}>
                <i className="fas fa-hourglass-half" />
              </div>
              <div>
                <p className="caja-summary-card__label">Falta cobrar</p>
                <p className="caja-summary-card__value" style={{ color: "#b91c1c" }}>{formatGs(adminData.faltaCobrar)}</p>
                <p className="caja-summary-card__sub">{adminFiltroAnio || new Date().getFullYear()}</p>
                <p className="caja-summary-card__sub" style={{ color: "#9ca3af", marginTop: 2, fontSize: 11 }}>
                  Bruto − todo lo pagado en tratamientos
                </p>
              </div>
            </div>

            <div className="caja-summary-card">
              <div className="caja-summary-card__icon caja-summary-card__icon--cobrado">
                <i className="fas fa-calendar-alt" />
              </div>
              <div>
                <p className="caja-summary-card__label">Ingreso Anual − Laboratorio Anual</p>
                <p className="caja-summary-card__value">{formatGs(adminData.totalIngresadoAnual)}</p>
                <p className="caja-summary-card__sub">{adminFiltroAnio || new Date().getFullYear()}</p>
              </div>
            </div>

            <div className="caja-summary-card">
              <div className="caja-summary-card__icon" style={{ background: "#ede9fe", color: "#5b21b6" }}>
                <i className="fas fa-flask" />
              </div>
              <div>
                <p className="caja-summary-card__label">Laboratorio</p>
                <p className="caja-summary-card__value">{formatGs(adminData.totalLaboratorio)}</p>
                <p className="caja-summary-card__sub">{anioLabel}</p>
              </div>
            </div>
          </div>

          {/* Sección: Ingresos por mes */}
          <div style={{ marginTop: 24, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px", background: "#f9fafb", borderRadius: "12px 12px 0 0",
              border: "1px solid #e5e7eb", borderBottom: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fas fa-chart-bar" style={{ color: "#6b7280", fontSize: 14 }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: "#374151" }}>
                  Ingresos por mes — global
                </span>
              </div>
            </div>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "0 0 12px 12px", background: "white", overflow: "hidden" }}>
              {adminMesesFiltrados.length > 0 ? adminMesesFiltrados.map((item, i) => (
                <div key={i} onClick={() => abrirAdminDetalle(item)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", cursor: "pointer",
                    borderBottom: i < adminMesesFiltrados.length - 1 ? "1px solid #f3f4f6" : "none",
                    background: "white", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f3f4f6",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="fas fa-calendar" style={{ color: "#6b7280", fontSize: 14 }} />
                    </div>
                    <span style={{ fontWeight: 500, color: "#374151", fontSize: 14 }}>{item.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 700, color: "rgb(160,100,20)", fontSize: 14 }}>{formatGs(item.ganancia)}</span>
                    <i className="fas fa-chevron-right" style={{ color: "#d1d5db", fontSize: 11 }} />
                  </div>
                </div>
              )) : (
                <div style={{ padding: "20px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                  <i className="fa-solid fa-file-circle-exclamation" style={{ marginRight: 6 }} />
                  Sin registros para el período seleccionado
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal detalle laboratorio admin */}
        <div className="modal-overlay" style={{ display: modalAdminLab.open ? "flex" : "none" }}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Laboratorio — {modalAdminLab.label}</h2>
              <button className="modal-close" onClick={() => setModalAdminLab((p) => ({ ...p, open: false }))}>&times;</button>
            </div>
            <div className="modal-body">
              {modalAdminLab.detalle.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Fecha</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Laboratorio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalAdminLab.detalle.map((item, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 12px", color: "#374151" }}>
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
                        {formatGs(modalAdminLab.ganancia)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="caja-empty">
                  <i className="fa-solid fa-file-circle-exclamation" />
                  <p>Sin gastos de laboratorio en este mes</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setModalAdminLab((p) => ({ ...p, open: false }))}>Cerrar</button>
            </div>
          </div>
        </div>

        {/* Modal detalle admin */}
        <div className="modal-overlay" style={{ display: modalAdmin.open ? "flex" : "none" }}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Detalle global — {modalAdmin.label}</h2>
              <button className="modal-close" onClick={() => setModalAdmin((p) => ({ ...p, open: false }))}>&times;</button>
            </div>
            <div className="modal-body">
              {modalAdmin.detalle.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left",  padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Fecha</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Importe recibido</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Laboratorio</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalAdmin.detalle.map((item, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 12px", color: "#374151" }}>
                          <i className="fas fa-calendar-day" style={{ marginRight: 8, color: "#9ca3af" }} />
                          {item.fecha}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#374151" }}>
                          {formatGs(item.recibido)}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#5b21b6" }}>
                          {item.laboratorio > 0 ? `− ${formatGs(item.laboratorio)}` : "—"}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "rgb(160,100,20)" }}>
                          {formatGs(item.neto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "#374151", borderTop: "2px solid #e5e7eb" }}>Total</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#374151", borderTop: "2px solid #e5e7eb" }}>
                        {formatGs(modalAdmin.detalle.reduce((a, i) => a + i.recibido, 0))}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#5b21b6", borderTop: "2px solid #e5e7eb" }}>
                        {modalAdmin.detalle.some(i => i.laboratorio > 0)
                          ? `− ${formatGs(modalAdmin.detalle.reduce((a, i) => a + i.laboratorio, 0))}`
                          : "—"}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "rgb(160,100,20)", borderTop: "2px solid #e5e7eb" }}>
                        {formatGs(modalAdmin.ganancia)}
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
              <button className="btn-cancel" onClick={() => setModalAdmin((p) => ({ ...p, open: false }))}>Cerrar</button>
            </div>
          </div>
        </div>
      </>
    );
  }
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="caja-page">
        <div className="caja-header" style={{ alignItems: "center" }}>
          <div>
            <h1 className="caja-header__title">Caja</h1>
            <p className="caja-header__subtitle">{nombreCompleto}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              className="caja-select"
              value={filtroAnio}
              onChange={(e) => { const a = e.target.value; setFiltroAnio(a); setFiltroMes(""); fetchPeriodo(a, ""); }}
            >
              {aniosDisponibles.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              className="caja-select"
              value={filtroMes}
              onChange={(e) => { const m = e.target.value; setFiltroMes(m); fetchPeriodo(filtroAnio, m); }}
            >
              <option value="">Todos los meses</option>
              {mesesDisponibles.map((m) => <option key={m} value={m}>{MESES_ES[m]}</option>)}
            </select>
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

        {/* ── Sección: Todos los turnos ── */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8,
            padding: "12px 16px", background: "#f9fafb", borderRadius: "12px 12px 0 0",
            border: "1px solid #e5e7eb", borderBottom: "none" }}>
            <i className="fas fa-calendar-check" style={{ color: "#6b7280", fontSize: 14 }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: "#374151" }}>Todos mis turnos</span>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "0 0 12px 12px", background: "white", overflow: "hidden" }}>
            {mesesFiltrados.length > 0 ? mesesFiltrados.map((item, i) => (
              <div key={i} onClick={() => abrirDetalle(item)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", cursor: "pointer",
                  borderBottom: i < mesesFiltrados.length - 1 ? "1px solid #f3f4f6" : "none",
                  background: "white", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f3f4f6",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fas fa-calendar" style={{ color: "#6b7280", fontSize: 14 }} />
                  </div>
                  <span style={{ fontWeight: 500, color: "#374151", fontSize: 14 }}>{item.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, color: "rgb(160,100,20)", fontSize: 14 }}>{formatGs(item.ganancia)}</span>
                  <i className="fas fa-chevron-right" style={{ color: "#d1d5db", fontSize: 11 }} />
                </div>
              </div>
            )) : (
              <div style={{ padding: "20px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                <i className="fa-solid fa-file-circle-exclamation" style={{ marginRight: 6 }} />
                Sin registros para el período seleccionado
              </div>
            )}
          </div>
        </div>

        {/* ── Sección: Solo (sin compartir) ── */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", background: "#eff6ff", borderRadius: "12px 12px 0 0",
            border: "1px solid #bfdbfe", borderBottom: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fas fa-user" style={{ color: "#1d4ed8", fontSize: 14 }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#1d4ed8" }}>Mis turnos atendidos solo</span>
              <span style={{ fontSize: 11, color: "#3b82f6", background: "#dbeafe",
                borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>Sin compartir</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1d4ed8" }}>{formatGs(totalSolo)}</span>
          </div>
          <div style={{ border: "1px solid #bfdbfe", borderRadius: "0 0 12px 12px", background: "white", overflow: "hidden" }}>
            {soloFiltrados.length > 0 ? soloFiltrados.map((item, i) => (
              <div key={i} onClick={() => abrirDetalleSolo(item)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", cursor: "pointer",
                  borderBottom: i < soloFiltrados.length - 1 ? "1px solid #f3f4f6" : "none",
                  background: "white", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#dbeafe",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fas fa-calendar" style={{ color: "#1d4ed8", fontSize: 14 }} />
                  </div>
                  <span style={{ fontWeight: 500, color: "#374151", fontSize: 14 }}>{item.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, color: "#1d4ed8", fontSize: 14 }}>{formatGs(item.ganancia)}</span>
                  <i className="fas fa-chevron-right" style={{ color: "#d1d5db", fontSize: 11 }} />
                </div>
              </div>
            )) : (
              <div style={{ padding: "20px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                <i className="fa-solid fa-file-circle-exclamation" style={{ marginRight: 6 }} />
                Sin turnos solo en el período seleccionado
              </div>
            )}
          </div>
        </div>

        {/* ── Sección: Compartido con doctor ── */}
        <div style={{ marginTop: 16, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", background: "#fdf2f8", borderRadius: "12px 12px 0 0",
            border: "1px solid #fbcfe8", borderBottom: "none", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <i className="fas fa-user-group" style={{ color: "#9d174d", fontSize: 14 }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#9d174d" }}>Turnos compartidos con</span>
              <select
                className="caja-select"
                style={{ fontSize: 12, padding: "3px 8px" }}
                value={doctorSeleccionado}
                onChange={(e) => { setDoctorSeleccionado(e.target.value); fetchCompartidoMeses(e.target.value); }}
              >
                <option value="">— Seleccionar doctor —</option>
                {listDoctores.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>
                ))}
              </select>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#9d174d" }}>{formatGs(totalCompartido)}</span>
          </div>
          <div style={{ border: "1px solid #fbcfe8", borderRadius: "0 0 12px 12px", background: "white", overflow: "hidden" }}>
            {!doctorSeleccionado ? (
              <div style={{ padding: "20px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                <i className="fas fa-user-group" style={{ marginRight: 6, color: "#e9a8c7" }} />
                Seleccioná un doctor para ver los turnos compartidos
              </div>
            ) : compartidoFiltrados.length > 0 ? compartidoFiltrados.map((item, i) => (
              <div key={i} onClick={() => abrirDetalleCompartido(item)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", cursor: "pointer",
                  borderBottom: i < compartidoFiltrados.length - 1 ? "1px solid #f3f4f6" : "none",
                  background: "white", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf2f8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fce7f3",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fas fa-calendar" style={{ color: "#9d174d", fontSize: 14 }} />
                  </div>
                  <span style={{ fontWeight: 500, color: "#374151", fontSize: 14 }}>{item.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, color: "#9d174d", fontSize: 14 }}>{formatGs(item.ganancia)}</span>
                  <i className="fas fa-chevron-right" style={{ color: "#d1d5db", fontSize: 11 }} />
                </div>
              </div>
            )) : (
              <div style={{ padding: "20px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                <i className="fa-solid fa-file-circle-exclamation" style={{ marginRight: 6 }} />
                Sin turnos compartidos en el período seleccionado
              </div>
            )}
          </div>
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

      {/* Modal detalle solo */}
      <div className="modal-overlay" style={{ display: modalSolo.open ? "flex" : "none" }}>
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">
              {nombreCompleto} — Solo — {modalSolo.label}
            </h2>
            <button className="modal-close" onClick={() => setModalSolo((p) => ({ ...p, open: false }))}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            {modalSolo.detalle.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Fecha</th>
                    <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Ganancia (solo)</th>
                  </tr>
                </thead>
                <tbody>
                  {modalSolo.detalle.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 12px", color: "#374151" }}>
                        <i className="fas fa-calendar-day" style={{ marginRight: 8, color: "#9ca3af" }} />
                        {item.fecha}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#1d4ed8" }}>
                        {formatGs(item.ganancia)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#374151", borderTop: "2px solid #e5e7eb" }}>Total</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#1d4ed8", borderTop: "2px solid #e5e7eb" }}>
                      {formatGs(modalSolo.ganancia)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="caja-empty">
                <i className="fa-solid fa-file-circle-exclamation" />
                <p>Sin movimientos solo en este mes</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setModalSolo((p) => ({ ...p, open: false }))}>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal detalle compartido */}
      <div className="modal-overlay" style={{ display: modalCompartido.open ? "flex" : "none" }}>
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">
              {nombreCompleto} — Compartido —{" "}
              {listDoctores.find((d) => String(d.id) === String(doctorSeleccionado))?.nombre}{" "}
              {listDoctores.find((d) => String(d.id) === String(doctorSeleccionado))?.apellido} —{" "}
              {modalCompartido.label}
            </h2>
            <button className="modal-close" onClick={() => setModalCompartido((p) => ({ ...p, open: false }))}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            {modalCompartido.detalle.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Fecha</th>
                    <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Ganancia (mi parte)</th>
                  </tr>
                </thead>
                <tbody>
                  {modalCompartido.detalle.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 12px", color: "#374151" }}>
                        <i className="fas fa-calendar-day" style={{ marginRight: 8, color: "#9ca3af" }} />
                        {item.fecha}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#9d174d" }}>
                        {formatGs(item.ganancia)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#374151", borderTop: "2px solid #e5e7eb" }}>Total</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#9d174d", borderTop: "2px solid #e5e7eb" }}>
                      {formatGs(modalCompartido.ganancia)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="caja-empty">
                <i className="fa-solid fa-file-circle-exclamation" />
                <p>Sin movimientos compartidos en este mes</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setModalCompartido((p) => ({ ...p, open: false }))}>
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
