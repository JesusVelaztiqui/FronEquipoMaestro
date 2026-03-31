import { useState, useEffect, useCallback } from "react";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { sendData } from "../services/api";
import { listarCaja } from "../services/urls";
import { useNavigate } from "react-router-dom";

const MESES_EN_ES = {
  January: "Enero",
  February: "Febrero",
  March: "Marzo",
  April: "Abril",
  May: "Mayo",
  June: "Junio",
  July: "Julio",
  August: "Agosto",
  September: "Septiembre",
  October: "Octubre",
  November: "Noviembre",
  December: "Diciembre",
};

const traducirMes = (mes) => {
  if (!mes) return "";
  return mes.replace(
    /January|February|March|April|May|June|July|August|September|October|November|December/gi,
    (m) => MESES_EN_ES[m] || m,
  );
};

// "March 2026" → "2026"
const extraerAnio = (mes) => {
  if (!mes) return "";
  const match = mes.match(/\d{4}/);
  return match ? match[0] : "";
};

// "March 2026" → "Marzo"
const extraerMes = (mes) => {
  if (!mes) return "";
  return traducirMes(mes)
    .replace(/\s*\d{4}/, "")
    .trim();
};

const formatGs = (valor) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const Caja = () => {
  const [listCaja, setListCaja] = useState([]);
  const [filtroAnio, setFiltroAnio] = useState(
    String(new Date().getFullYear()),
  );
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroDoctor, setFiltroDoctor] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null);
  const navigate = useNavigate();

  const getCaja = useCallback(async () => {
    try {
      cargarLoader();
      const response = await sendData(listarCaja, "GET", null, null);
      if (response?.status === 200) {
        setListCaja(response?.data);
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
  }, [navigate]);

  useEffect(() => {
    getCaja();
  }, [getCaja]);

  useEffect(() => {
    if (!openModal) setCajaSeleccionada(null);
  }, [openModal]);

  // Opciones únicas para los filtros
  const aniosDisponibles = [
    ...new Set(listCaja.map((item) => extraerAnio(item.mes)).filter(Boolean)),
  ].sort();
  const mesesDisponibles = [
    ...new Set(listCaja.map((item) => extraerMes(item.mes)).filter(Boolean)),
  ];
  const doctoresDisponibles = [
    ...new Set(
      listCaja.map((item) => `${item.nombre} ${item.apellido}`).filter(Boolean),
    ),
  ].sort();

  const cajaFiltrada = listCaja.filter((item) => {
    const anioItem = extraerAnio(item.mes);
    const mesItem = extraerMes(item.mes);
    const doctorItem = `${item.nombre} ${item.apellido}`;
    if (filtroAnio && anioItem !== filtroAnio) return false;
    if (filtroMes && mesItem !== filtroMes) return false;
    if (filtroDoctor && doctorItem !== filtroDoctor) return false;
    return true;
  });

  const sumaTotalMes = cajaFiltrada.reduce(
    (acc, item) => acc + (item.total || 0),
    0,
  );
  const sumaTotalDescuento = cajaFiltrada.reduce(
    (acc, item) => acc + (item.totalSinDescuento || 0),
    0,
  );

  const abrirModal = (item) => {
    setCajaSeleccionada(item);
    setOpenModal(true);
  };

  return (
    <>
      <div className="caja-page">
        <div className="caja-header">
          <div>
            <h1 className="caja-header__title">Caja</h1>
            <p className="caja-header__subtitle">
              Gestión de cobros y deudas por doctor
            </p>
          </div>

          <div className="caja-filtros">
            <select
              className="caja-select"
              value={filtroAnio}
              onChange={(e) => {
                setFiltroAnio(e.target.value);
                setFiltroMes("");
              }}
            >
              <option value="">Todos los años</option>
              {aniosDisponibles.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <select
              className="caja-select"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
            >
              <option value="">Todos los meses</option>
              {mesesDisponibles.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              className="caja-select"
              value={filtroDoctor}
              onChange={(e) => setFiltroDoctor(e.target.value)}
            >
              <option value="">Todos los doctores</option>
              {doctoresDisponibles.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
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
              <p className="caja-summary-card__label">
                Total Ingreso Equipo Maestro
              </p>
              <p className="caja-summary-card__value">
                {formatGs(sumaTotalDescuento)}
              </p>
            </div>
          </div>
          <div className="caja-summary-card">
            <div className="caja-summary-card__icon caja-summary-card__icon--pendiente">
              <i className="fas fa-hand-holding-dollar"></i>
            </div>
            <div>
              <p className="caja-summary-card__label">
                Total Egreso Equipo Maestro
              </p>
              <p className="caja-summary-card__value">
                {formatGs(sumaTotalMes)}
              </p>
            </div>
          </div>
        </div>

        <div className="caja-grid">
          {cajaFiltrada.length > 0 ? (
            cajaFiltrada.map((item) => (
              <div className="caja-card" key={item.id}>
                <div className="caja-card__header">
                  <div className="caja-card__avatar">
                    <i className="fas fa-user-doctor"></i>
                  </div>
                  <div className="caja-card__info">
                    <p className="caja-card__nombre">
                      {item.nombre} {item.apellido}
                    </p>
                    <p className="caja-card__periodo">
                      {traducirMes(item.mes)}
                    </p>
                  </div>
                </div>

                <div className="caja-card__body">
                  <div className="caja-card__row">
                    <span className="caja-card__row-label">
                      Total Ingreso Del Mes
                    </span>
                    <span className="caja-card__row-value">
                      {formatGs(item.totalSinDescuento)}
                    </span>
                  </div>
                  <div className="caja-card__row">
                    <span className="caja-card__row-label">Total a Pagar</span>
                    <span className="caja-card__row-value caja-card__row-value--deuda">
                      {formatGs(item.total)}
                    </span>
                  </div>
                  <div className="caja-card__row">
                    <span className="caja-card__row-label">% Promedio</span>
                    <span className="caja-card__row-value">
                      {item.porcentaje}%
                    </span>
                  </div>
                </div>

                <div className="caja-card__footer">
                  <button
                    className="caja-card__btn caja-card__btn--historial"
                    onClick={() => abrirModal(item)}
                  >
                    <i className="fas fa-eye"></i>
                    Ver detalle
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="caja-empty">
              <i className="fa-solid fa-file-circle-exclamation"></i>
              <p>Sin registros para el período seleccionado</p>
            </div>
          )}
        </div>
      </div>

      <div
        className="modal-overlay"
        style={{ display: openModal ? "flex" : "none" }}
      >
        <div className="modal caja-modal">
          <div className="modal-header">
            <h2 className="modal-title">
              {cajaSeleccionada
                ? `${cajaSeleccionada.nombre} ${cajaSeleccionada.apellido} — ${traducirMes(cajaSeleccionada.mes)}`
                : "Detalle de Caja"}
            </h2>
            <button className="modal-close" onClick={() => setOpenModal(false)}>
              &times;
            </button>
          </div>

          {cajaSeleccionada && (
            <div className="modal-body">
              <div className="caja-modal-info">
                <div className="caja-modal-info-item">
                  <span className="caja-modal-info-item__label">
                    Total del Mes
                  </span>
                  <span className="caja-modal-info-item__value">
                    {formatGs(cajaSeleccionada.totalSinDescuento)}
                  </span>
                </div>
                <div className="caja-modal-info-item">
                  <span className="caja-modal-info-item__label">
                    Total a Pagar
                  </span>
                  <span className="caja-modal-info-item__value caja-modal-info-item__value--deuda">
                    {formatGs(cajaSeleccionada.total)}
                  </span>
                </div>
                <div className="caja-modal-info-item">
                  <span className="caja-modal-info-item__label">
                    % Promedio
                  </span>
                  <span className="caja-modal-info-item__value">
                    {cajaSeleccionada.porcentaje}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setOpenModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Caja;
