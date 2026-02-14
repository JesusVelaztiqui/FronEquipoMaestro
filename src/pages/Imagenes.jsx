import { useState, useRef, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { sendData } from "../services/api";
import { listarImagenes } from "../services/urls";

const Imagenes = () => {
  const { id } = useParams();
  const [listImagenes, setListimagenes] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const getImagenes = async () => {
    try {
      cargarLoader();
      const response = await sendData(
        listarImagenes,
        "GET",
        `?id=${parseInt(id)}`,
        null,
      );
      if (response.status === 200) {
        setListimagenes(response?.data);
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: response?.mensaje,
          duration: 3000,
        });
      }
    } catch (error) {
      Navigate("/login");
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
  console.log(listImagenes);

  const mockDoctors = [
    {
      id: 1,
      name: "Juan Pérez",
      specialty: "Cardiología",
      phone: "0991 123 456",
      license: "MED-12345",
    },
    {
      id: 2,
      name: "Ana Gómez",
      specialty: "Pediatría",
      phone: "0982 555 222",
      license: "MED-67890",
    },
    {
      id: 3,
      name: "Carlos López",
      specialty: "Dermatología",
      phone: "0971 000 789",
      license: "MED-11111",
    },
  ];

  useEffect(() => {
    getImagenes();
  }, []);

  return (
    <>
      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Imagenes</h1>
            <p className="mock-papers__subtitle">Imagenes del paciente</p>
          </div>

          <div className="mock-papers__search">
            <div className="input-group">
              <div className="input-search">
                <input
                  type="text"
                  className="input-field input-field--search"
                  placeholder="Buscar..."
                />
                <svg
                  className="input-search__icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <button
            className="mock-papers__upload-btn"
            onClick={() => setOpenModal(true)}
          >
            NUEVO <i className="fas fa-plus" />
          </button>
        </div>

        <div className="mock-papers__table-card">
          <div className="mock-papers__table-wrapper">
            <table className="mock-papers__table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listImagenes?.map((img, index) => (
                  <tr key={img.id}>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      <img
                        src={img.url}
                        alt={`Imagen ${img.id}`}
                        style={{ width: "100px", height: "auto" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mock-papers__pagination">
            <button className="mock-papers__arrow-btn">←</button>
            <span className="mock-papers__page-btn">{11}</span>/
            <span className="mock-papers__page-btn">{2}</span>
            <button className="mock-papers__arrow-btn">→</button>
          </div>
        </div>
      </div>

      <div
        className="modal-overlay"
        style={{ display: openModal ? "flex" : "none" }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">Registro de producto</h2>
            <button className="modal-close" onClick={() => setOpenModal(false)}>
              &times;
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Código</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Nombre</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Marca</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>
            </div>
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Precio</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>

              <div className="input-group">
                <label className="input-label">Cantidad</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Escribe aquí..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Vencimiento</label>
                <input type="date" className="input-field" />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Descripción</label>
                <textarea
                  className="input-textarea"
                  placeholder="Notas adicionales sobre el producto, indicaciones o advertencias"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setOpenModal(false)}>
              Cancelar
            </button>
            <button className="btn-submit">Guardar</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Imagenes;
