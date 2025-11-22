import { useState } from "react";
import { formatoFecha } from "./Formatos";

const Payment = ({ setIsOpen, isOpen, detalles, setDetallePlan }) => {
  const [cajas, setCajas] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {cajas ? (
              <div className="empty-card transladarItems">
                <div className="cardCajas">
                  <div className="card-header">
                    <span className="bill-id">AUMENTAR CAJAS</span>
                    <div className="card-actions">
                      <span
                        className="close-icon"
                        onClick={() => setCajas(false)}
                      >
                        ✕
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            <div
              className={`modal-card ${
                cajas ? "transladarItems" : "removetransladarItems"
              }  `}
            >
              <div className="card-header">
                <span className="bill-id">PLAN {detalles?.tipoLicencia}</span>
                <div className="card-actions">
                  <span className="close-icon" onClick={() => setIsOpen(false)}>
                    ✕
                  </span>
                </div>
              </div>

              <div className="card-content">
                <div className="patient-info">
                  <div className="patient-details">
                    <h3>{detalles?.tituloInfomacion}</h3>
                    <p>{detalles?.iformacion}</p>
                    <span className="unpaid-status">ATENCIÓN</span>
                  </div>
                </div>

                <div className="bill-items">
                  <div className="item-header">
                    <span>Items</span>
                    <span>Precios</span>
                  </div>

                  <div className="item">
                    <div className="item-info">
                      <i className="fa-solid fa-file-alt item-icon"></i>
                      <span>Licencia Emprendedor</span>
                    </div>
                    <span className="amount">{detalles?.precioLicencia}</span>
                  </div>

                  <div className="item">
                    <div className="item-info">
                      <i className="fa-solid fa-box item-icon"></i>
                      <span>Cajas ( 1 )</span>
                    </div>
                    <span className="amount">{detalles?.precioCajas}</span>
                  </div>

                  <div className="item">
                    <div className="item-info">
                      <i className="fa-solid fa-users item-icon"></i>
                      <span>Usuarios ilimitados</span>
                    </div>
                    <span className="amount">₲ 0</span>
                  </div>
                </div>

                <div className="patient-info">
                  <div className="patient-header">
                    <span className="bill-to">INGRESO</span>
                    <span className="date">
                      {formatoFecha(detalles?.licfechaingreso, "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="patient-header">
                    <span className="bill-to">VENCIMIENTO</span>
                    <span className="date">
                      {" "}
                      {formatoFecha(detalles?.licfechafin, "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>

                <div className="notes-section">
                  <label>Agregar nota ( Opcional )</label>
                  <textarea
                    className="textareaLogin"
                    placeholder="Datos adicionales - contacto #### - ### - ###"
                  ></textarea>
                </div>

                <div className="total-section">
                  {/* <div className="total-row">
                    <span>Subtotal</span>
                    <span>$ 435.00</span>
                  </div> */}
                  <div className="total-row total-final">
                    <span>Total</span>
                    <span>₲ 100.000</span>
                  </div>
                </div>

                <div className="payment-section">
                  <span className="payment-label">MEJORAR PLAN</span>
                  <div className="payment-options">
                    <div
                      className="payment-option"
                      onClick={() => {
                        setCajas(true);
                      }}
                    >
                      <span className="payment-icon">
                        <i className="fas fa-boxes"></i>
                      </span>
                      <span>Aumentar Cajas</span>
                      <span className="arrow">›</span>
                    </div>
                    <div className="payment-option pagar">
                      <span className="payment-icon">
                        <i className="far fa-credit-card"></i>
                      </span>
                      <span className="textpagar">COMPRAR</span>
                      <span className="arrow">›</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Payment;
