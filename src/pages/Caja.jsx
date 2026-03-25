import { useState, useEffect } from "react";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const mockCaja = [
  // ENERO
  {
    id: 1, iddoctor: 1, doctor: "Juan Pérez", mes: 1, anio: 2025,
    montototal: 1800000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-01-10", monto: 180000 },
      { id: 2, fecha: "2025-01-25", monto: 180000 },
    ],
  },
  {
    id: 2, iddoctor: 2, doctor: "Ana Gómez", mes: 1, anio: 2025,
    montototal: 1200000, porcentaje: 15, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-01-15", monto: 180000 },
    ],
  },
  {
    id: 3, iddoctor: 3, doctor: "Carlos López", mes: 1, anio: 2025,
    montototal: 2800000, porcentaje: 25, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-01-08", monto: 350000 },
      { id: 2, fecha: "2025-01-22", monto: 350000 },
    ],
  },
  // FEBRERO
  {
    id: 4, iddoctor: 1, doctor: "Juan Pérez", mes: 2, anio: 2025,
    montototal: 2100000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-02-05", monto: 210000 },
      { id: 2, fecha: "2025-02-20", monto: 210000 },
    ],
  },
  {
    id: 5, iddoctor: 2, doctor: "Ana Gómez", mes: 2, anio: 2025,
    montototal: 1600000, porcentaje: 15, sobrepagado: 0,
    pagos: [],
  },
  {
    id: 6, iddoctor: 3, doctor: "Carlos López", mes: 2, anio: 2025,
    montototal: 3100000, porcentaje: 25, sobrepagado: 30000,
    pagos: [
      { id: 1, fecha: "2025-02-10", monto: 387500 },
      { id: 2, fecha: "2025-02-25", monto: 387500 },
    ],
  },
  // MARZO
  {
    id: 7, iddoctor: 1, doctor: "Juan Pérez", mes: 3, anio: 2025,
    montototal: 2000000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-03-10", monto: 200000 },
      { id: 2, fecha: "2025-03-20", monto: 200000 },
    ],
  },
  {
    id: 8, iddoctor: 2, doctor: "Ana Gómez", mes: 3, anio: 2025,
    montototal: 1500000, porcentaje: 15, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-03-05", monto: 225000 },
    ],
  },
  {
    id: 9, iddoctor: 3, doctor: "Carlos López", mes: 3, anio: 2025,
    montototal: 3000000, porcentaje: 25, sobrepagado: 50000,
    pagos: [
      { id: 1, fecha: "2025-03-02", monto: 400000 },
      { id: 2, fecha: "2025-03-15", monto: 350000 },
    ],
  },
  // ABRIL
  {
    id: 10, iddoctor: 1, doctor: "Juan Pérez", mes: 4, anio: 2025,
    montototal: 1950000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-04-08", monto: 195000 },
    ],
  },
  {
    id: 11, iddoctor: 2, doctor: "Ana Gómez", mes: 4, anio: 2025,
    montototal: 1700000, porcentaje: 15, sobrepagado: 0,
    pagos: [],
  },
  {
    id: 12, iddoctor: 3, doctor: "Carlos López", mes: 4, anio: 2025,
    montototal: 2600000, porcentaje: 25, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-04-12", monto: 650000 },
    ],
  },
  // MAYO
  {
    id: 13, iddoctor: 1, doctor: "Juan Pérez", mes: 5, anio: 2025,
    montototal: 2300000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-05-03", monto: 230000 },
      { id: 2, fecha: "2025-05-17", monto: 230000 },
    ],
  },
  {
    id: 14, iddoctor: 2, doctor: "Ana Gómez", mes: 5, anio: 2025,
    montototal: 1400000, porcentaje: 15, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-05-10", monto: 210000 },
    ],
  },
  {
    id: 15, iddoctor: 3, doctor: "Carlos López", mes: 5, anio: 2025,
    montototal: 3200000, porcentaje: 25, sobrepagado: 0,
    pagos: [],
  },
  // JUNIO
  {
    id: 16, iddoctor: 1, doctor: "Juan Pérez", mes: 6, anio: 2025,
    montototal: 2150000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-06-05", monto: 215000 },
      { id: 2, fecha: "2025-06-20", monto: 215000 },
    ],
  },
  {
    id: 17, iddoctor: 2, doctor: "Ana Gómez", mes: 6, anio: 2025,
    montototal: 1550000, porcentaje: 15, sobrepagado: 0,
    pagos: [],
  },
  {
    id: 18, iddoctor: 3, doctor: "Carlos López", mes: 6, anio: 2025,
    montototal: 2900000, porcentaje: 25, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-06-15", monto: 725000 },
    ],
  },
  // JULIO
  {
    id: 19, iddoctor: 1, doctor: "Juan Pérez", mes: 7, anio: 2025,
    montototal: 2400000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-07-07", monto: 240000 },
      { id: 2, fecha: "2025-07-21", monto: 240000 },
    ],
  },
  {
    id: 20, iddoctor: 2, doctor: "Ana Gómez", mes: 7, anio: 2025,
    montototal: 1650000, porcentaje: 15, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-07-12", monto: 247500 },
    ],
  },
  {
    id: 21, iddoctor: 3, doctor: "Carlos López", mes: 7, anio: 2025,
    montototal: 3300000, porcentaje: 25, sobrepagado: 0,
    pagos: [],
  },
  // AGOSTO
  {
    id: 22, iddoctor: 1, doctor: "Juan Pérez", mes: 8, anio: 2025,
    montototal: 2250000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-08-04", monto: 225000 },
    ],
  },
  {
    id: 23, iddoctor: 2, doctor: "Ana Gómez", mes: 8, anio: 2025,
    montototal: 1800000, porcentaje: 15, sobrepagado: 20000,
    pagos: [
      { id: 1, fecha: "2025-08-09", monto: 270000 },
    ],
  },
  {
    id: 24, iddoctor: 3, doctor: "Carlos López", mes: 8, anio: 2025,
    montototal: 3050000, porcentaje: 25, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-08-14", monto: 400000 },
      { id: 2, fecha: "2025-08-28", monto: 362500 },
    ],
  },
  // SEPTIEMBRE
  {
    id: 25, iddoctor: 1, doctor: "Juan Pérez", mes: 9, anio: 2025,
    montototal: 2500000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-09-05", monto: 250000 },
      { id: 2, fecha: "2025-09-19", monto: 250000 },
    ],
  },
  {
    id: 26, iddoctor: 2, doctor: "Ana Gómez", mes: 9, anio: 2025,
    montototal: 1450000, porcentaje: 15, sobrepagado: 0,
    pagos: [],
  },
  {
    id: 27, iddoctor: 3, doctor: "Carlos López", mes: 9, anio: 2025,
    montototal: 3400000, porcentaje: 25, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-09-10", monto: 850000 },
    ],
  },
  // OCTUBRE
  {
    id: 28, iddoctor: 1, doctor: "Juan Pérez", mes: 10, anio: 2025,
    montototal: 2100000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-10-03", monto: 210000 },
      { id: 2, fecha: "2025-10-17", monto: 210000 },
    ],
  },
  {
    id: 29, iddoctor: 2, doctor: "Ana Gómez", mes: 10, anio: 2025,
    montototal: 1750000, porcentaje: 15, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-10-08", monto: 262500 },
    ],
  },
  {
    id: 30, iddoctor: 3, doctor: "Carlos López", mes: 10, anio: 2025,
    montototal: 2750000, porcentaje: 25, sobrepagado: 0,
    pagos: [],
  },
  // NOVIEMBRE
  {
    id: 31, iddoctor: 1, doctor: "Juan Pérez", mes: 11, anio: 2025,
    montototal: 2350000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-11-06", monto: 235000 },
    ],
  },
  {
    id: 32, iddoctor: 2, doctor: "Ana Gómez", mes: 11, anio: 2025,
    montototal: 1900000, porcentaje: 15, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-11-11", monto: 142500 },
      { id: 2, fecha: "2025-11-25", monto: 142500 },
    ],
  },
  {
    id: 33, iddoctor: 3, doctor: "Carlos López", mes: 11, anio: 2025,
    montototal: 3150000, porcentaje: 25, sobrepagado: 0,
    pagos: [],
  },
  // DICIEMBRE
  {
    id: 34, iddoctor: 1, doctor: "Juan Pérez", mes: 12, anio: 2025,
    montototal: 2700000, porcentaje: 20, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-12-05", monto: 270000 },
      { id: 2, fecha: "2025-12-19", monto: 270000 },
    ],
  },
  {
    id: 35, iddoctor: 2, doctor: "Ana Gómez", mes: 12, anio: 2025,
    montototal: 2000000, porcentaje: 15, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-12-08", monto: 300000 },
    ],
  },
  {
    id: 36, iddoctor: 3, doctor: "Carlos López", mes: 12, anio: 2025,
    montototal: 3500000, porcentaje: 25, sobrepagado: 0,
    pagos: [
      { id: 1, fecha: "2025-12-12", monto: 437500 },
      { id: 2, fecha: "2025-12-26", monto: 437500 },
    ],
  },
];

const formatGs = (valor) =>
  new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(valor || 0);

const formatFecha = (fechaStr) => {
  if (!fechaStr) return "-";
  const [y, m, d] = fechaStr.split("-");
  return `${d}/${m}/${y}`;
};

const Caja = () => {
  const [listCaja] = useState(mockCaja);
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("2025");
  const [openModal, setOpenModal] = useState(false);
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null);
  const [montoPago, setMontoPago] = useState("");
  const [sobrepagadoInput, setSobrepagadoInput] = useState("");

  useEffect(() => {
    if (!openModal) {
      setMontoPago("");
      setSobrepagadoInput("");
      setCajaSeleccionada(null);
    }
  }, [openModal]);

  const calcDeuda = (item) =>
    Math.round((parseFloat(item.montototal || 0) * parseFloat(item.porcentaje || 0)) / 100);

  const calcTotalPagado = (item) =>
    (item.pagos || []).reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);

  const calcPendiente = (item) => {
    const deuda = calcDeuda(item);
    const pagado = calcTotalPagado(item);
    return Math.max(deuda - pagado, 0);
  };

  const calcPorcentajePagado = (item) => {
    const deuda = calcDeuda(item);
    if (deuda === 0) return 100;
    return Math.min(Math.round((calcTotalPagado(item) / deuda) * 100), 100);
  };

  const ultimoPago = (item) => {
    const pagos = item.pagos || [];
    if (pagos.length === 0) return null;
    return pagos[pagos.length - 1];
  };

  const cajaFiltrada = listCaja.filter((item) => {
    const coincideMes = filtroMes ? String(item.mes) === filtroMes : true;
    const coincideAnio = filtroAnio ? String(item.anio) === filtroAnio : true;
    return coincideMes && coincideAnio;
  });

  const totalDeuda = cajaFiltrada.reduce((acc, item) => acc + calcDeuda(item), 0);
  const totalCobrado = cajaFiltrada.reduce((acc, item) => acc + calcTotalPagado(item), 0);
  const totalPendiente = cajaFiltrada.reduce((acc, item) => acc + calcPendiente(item), 0);

  const years = [...Array(5)].map((_, i) => new Date().getFullYear() - 2 + i);

  const abrirModal = (item) => {
    setCajaSeleccionada(item);
    setSobrepagadoInput(item.sobrepagado ? String(item.sobrepagado) : "");
    setMontoPago("");
    setOpenModal(true);
  };

  const historialConSaldo = (item) => {
    const deuda = calcDeuda(item);
    let acumulado = 0;
    return (item.pagos || []).map((p) => {
      acumulado += parseFloat(p.monto || 0);
      const falta = Math.max(deuda - acumulado, 0);
      return { ...p, acumulado, falta };
    });
  };

  return (
    <>
      <div className="caja-page">
        <div className="caja-header">
          <div>
            <h1 className="caja-header__title">Caja</h1>
            <p className="caja-header__subtitle">Gestión de cobros y deudas por doctor</p>
          </div>

          <div className="caja-filtros">
            <select
              className="caja-select"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
            >
              <option value="">Todos los meses</option>
              {MESES.map((m, i) => (
                <option key={i + 1} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            <select
              className="caja-select"
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
            >
              <option value="">Todos los años</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="caja-summary">
          <div className="caja-summary-card">
            <div className="caja-summary-card__icon caja-summary-card__icon--total">
              <i className="fas fa-file-invoice-dollar"></i>
            </div>
            <div>
              <p className="caja-summary-card__label">Total Deuda</p>
              <p className="caja-summary-card__value">{formatGs(totalDeuda)}</p>
            </div>
          </div>
          <div className="caja-summary-card">
            <div className="caja-summary-card__icon caja-summary-card__icon--cobrado">
              <i className="fas fa-circle-check"></i>
            </div>
            <div>
              <p className="caja-summary-card__label">Total Cobrado</p>
              <p className="caja-summary-card__value">{formatGs(totalCobrado)}</p>
            </div>
          </div>
          <div className="caja-summary-card">
            <div className="caja-summary-card__icon caja-summary-card__icon--pendiente">
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <p className="caja-summary-card__label">Total Pendiente</p>
              <p className="caja-summary-card__value">{formatGs(totalPendiente)}</p>
            </div>
          </div>
        </div>

        <div className="caja-grid">
          {cajaFiltrada.length > 0 ? (
            cajaFiltrada.map((item) => {
              const deuda = calcDeuda(item);
              const pagado = calcTotalPagado(item);
              const pendiente = calcPendiente(item);
              const porcentajePagado = calcPorcentajePagado(item);
              const estaPagado = pendiente === 0;
              const ultimo = ultimoPago(item);

              return (
                <div className="caja-card" key={item.id}>
                  <div className="caja-card__header">
                    <div className="caja-card__avatar">
                      <i className="fas fa-user-doctor"></i>
                    </div>
                    <div className="caja-card__info">
                      <p className="caja-card__nombre">{item.doctor}</p>
                      <p className="caja-card__periodo">
                        {MESES[(item.mes || 1) - 1]} {item.anio}
                      </p>
                    </div>
                    <span className={`caja-badge caja-badge--${estaPagado ? "pagado" : "pendiente"}`}>
                      {estaPagado ? "Pagado" : "Pendiente"}
                    </span>
                  </div>

                  <div className="caja-card__body">
                    <div className="caja-card__row">
                      <span className="caja-card__row-label">Monto turno</span>
                      <span className="caja-card__row-value">{formatGs(item.montototal)}</span>
                    </div>
                    <div className="caja-card__row">
                      <span className="caja-card__row-label">% Descuento</span>
                      <span className="caja-card__row-value">{item.porcentaje}%</span>
                    </div>
                    <div className="caja-card__row">
                      <span className="caja-card__row-label">Deuda</span>
                      <span className="caja-card__row-value caja-card__row-value--deuda">{formatGs(deuda)}</span>
                    </div>
                    <div className="caja-card__row">
                      <span className="caja-card__row-label">Pagado</span>
                      <span className="caja-card__row-value caja-card__row-value--pagado">{formatGs(pagado)}</span>
                    </div>
                    <div className="caja-card__row">
                      <span className="caja-card__row-label">Falta pagar</span>
                      <span className={`caja-card__row-value ${pendiente > 0 ? "caja-card__row-value--pendiente" : "caja-card__row-value--pagado"}`}>
                        {formatGs(pendiente)}
                      </span>
                    </div>
                    {parseFloat(item.sobrepagado || 0) > 0 && (
                      <div className="caja-card__row">
                        <span className="caja-card__row-label">Sobrepagado</span>
                        <span className="caja-card__row-value">{formatGs(item.sobrepagado)}</span>
                      </div>
                    )}

                    <div className="caja-card__progress-wrapper">
                      <div className="caja-card__progress-label">
                        <span>Progreso de pago</span>
                        <span>{porcentajePagado}%</span>
                      </div>
                      <div className="caja-card__progress-bar">
                        <div
                          className={`caja-card__progress-fill ${estaPagado ? "caja-card__progress-fill--completo" : ""}`}
                          style={{ width: `${porcentajePagado}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="caja-card__ultimo-pago">
                      <i className="fas fa-calendar-day"></i>
                      {ultimo
                        ? <span>Último pago: <strong>{formatFecha(ultimo.fecha)}</strong> — {formatGs(ultimo.monto)}</span>
                        : <span className="caja-card__sin-pago">Sin pagos registrados</span>
                      }
                    </div>
                  </div>

                  <div className="caja-card__footer">
                    <button
                      className="caja-card__btn caja-card__btn--historial"
                      onClick={() => abrirModal(item)}
                    >
                      <i className="fas fa-clock-rotate-left"></i>
                      Ver historial
                    </button>
                    {!estaPagado && (
                      <button
                        className="caja-card__btn caja-card__btn--pagar"
                        onClick={() => abrirModal(item)}
                      >
                        <i className="fas fa-money-bill-wave"></i>
                        Registrar Pago
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="caja-empty">
              <i className="fa-solid fa-file-circle-exclamation"></i>
              <p>Sin registros para el período seleccionado</p>
            </div>
          )}
        </div>
      </div>

      <div className="modal-overlay" style={{ display: openModal ? "flex" : "none" }}>
        <div className="modal caja-modal">
          <div className="modal-header">
            <h2 className="modal-title">
              {cajaSeleccionada
                ? `${cajaSeleccionada.doctor} — ${MESES[(cajaSeleccionada.mes || 1) - 1]} ${cajaSeleccionada.anio}`
                : "Detalle de Caja"}
            </h2>
            <button className="modal-close" onClick={() => setOpenModal(false)}>&times;</button>
          </div>

          {cajaSeleccionada && (
            <div className="modal-body">
              <div className="caja-modal-info">
                <div className="caja-modal-info-item">
                  <span className="caja-modal-info-item__label">Monto Turno</span>
                  <span className="caja-modal-info-item__value">{formatGs(cajaSeleccionada.montototal)}</span>
                </div>
                <div className="caja-modal-info-item">
                  <span className="caja-modal-info-item__label">% Descuento</span>
                  <span className="caja-modal-info-item__value">{cajaSeleccionada.porcentaje}%</span>
                </div>
                <div className="caja-modal-info-item">
                  <span className="caja-modal-info-item__label">Deuda Total</span>
                  <span className="caja-modal-info-item__value caja-modal-info-item__value--deuda">
                    {formatGs(calcDeuda(cajaSeleccionada))}
                  </span>
                </div>
                <div className="caja-modal-info-item">
                  <span className="caja-modal-info-item__label">Ya Pagado</span>
                  <span className="caja-modal-info-item__value caja-modal-info-item__value--pagado">
                    {formatGs(calcTotalPagado(cajaSeleccionada))}
                  </span>
                </div>
                <div className="caja-modal-info-item">
                  <span className="caja-modal-info-item__label">Falta Pagar</span>
                  <span className="caja-modal-info-item__value caja-modal-info-item__value--pendiente">
                    {formatGs(calcPendiente(cajaSeleccionada))}
                  </span>
                </div>
                <div className="caja-modal-info-item">
                  <span className="caja-modal-info-item__label">Estado</span>
                  <span className={`caja-badge caja-badge--${calcPendiente(cajaSeleccionada) === 0 ? "pagado" : "pendiente"}`}>
                    {calcPendiente(cajaSeleccionada) === 0 ? "Pagado" : "Pendiente"}
                  </span>
                </div>
              </div>

              <div className="caja-historial">
                <p className="caja-historial__titulo">
                  <i className="fas fa-clock-rotate-left"></i>
                  Historial de pagos
                </p>

                {historialConSaldo(cajaSeleccionada).length > 0 ? (
                  <div className="caja-historial__tabla-wrapper">
                    <table className="caja-historial__tabla">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Fecha</th>
                          <th>Monto Pagado</th>
                          <th>Acumulado</th>
                          <th>Falta Pagar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialConSaldo(cajaSeleccionada).map((p, i) => (
                          <tr key={p.id}>
                            <td>{String(i + 1).padStart(2, "0")}</td>
                            <td>
                              <span className="caja-historial__fecha">
                                <i className="fas fa-calendar-day"></i>
                                {formatFecha(p.fecha)}
                              </span>
                            </td>
                            <td className="caja-historial__monto--pagado">{formatGs(p.monto)}</td>
                            <td>{formatGs(p.acumulado)}</td>
                            <td className={p.falta > 0 ? "caja-historial__monto--pendiente" : "caja-historial__monto--ok"}>
                              {formatGs(p.falta)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="caja-historial__empty">
                    <i className="fas fa-receipt"></i>
                    <span>Sin pagos registrados aún</span>
                  </div>
                )}
              </div>

              {calcPendiente(cajaSeleccionada) > 0 && (
                <div className="caja-nuevo-pago">
                  <p className="caja-nuevo-pago__titulo">
                    <i className="fas fa-plus-circle"></i>
                    Registrar nuevo pago
                  </p>
                  <div className="modal-row">
                    <div className="input-group">
                      <label className="input-label">Monto a pagar (Gs.)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={montoPago}
                        onChange={(e) => setMontoPago(e.target.value)}
                        placeholder="Ingrese el monto en guaraníes..."
                        min="0"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Sobrepagado (Gs.)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={sobrepagadoInput}
                        onChange={(e) => setSobrepagadoInput(e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setOpenModal(false)}>Cerrar</button>
            {cajaSeleccionada && calcPendiente(cajaSeleccionada) > 0 && (
              <button className="btn-submit">Guardar Pago</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Caja;
