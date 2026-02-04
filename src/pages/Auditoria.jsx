import { useState, useRef, useEffect } from "react";
import { addToast } from "../components/Tooltip";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { sendData } from "../services/api";
import { listarAuditoria } from "../services/urls";
import { calcRows, formatearFechaHora } from "../components/Formatos";

const Auditoria = () => {
  const [pagina, setPagina] = useState(0);
  const [listAuditoria, setAuditoria] = useState([]);
  const tableWrapperRef = useRef(null);
  const rowRef = useRef(null);
  const [filas, setFilas] = useState(8);
  const [search, setSearch] = useState("");

  async function getAuditoria() {
    try {
      cargarLoader();
      const response = await sendData(listarAuditoria, "GET", null, null);
      if (response.status === 200) {
        setAuditoria(response.data);
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: response?.mensaje,
          duration: 3000,
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: error,
        duration: 3000,
      });
    } finally {
      ocultarLoader();
    }
  }

  useEffect(() => {
    if (tableWrapperRef.current && rowRef.current) {
      setFilas(calcRows(tableWrapperRef.current, rowRef.current));
    }
  }, [listAuditoria]);

  useEffect(() => {
    getAuditoria();
  }, []);

  const auditoriaFiltrada = listAuditoria.filter((audi) => {
    const texto = search.toLowerCase();
    return (
      audi.usuario?.toLowerCase().includes(texto) ||
      audi.accion?.toLowerCase().includes(texto) ||
      audi.pantalla?.toLowerCase().includes(texto) ||
      audi.concepto?.toLowerCase().includes(texto)
    );
  });

  const totalPaginas = Math.ceil(auditoriaFiltrada.length / filas);

  const inicio = pagina * filas;
  const fin = inicio + filas;
  const auditoriaPaginada = auditoriaFiltrada.slice(inicio, fin);

  return (
    <div className="mock-papers">
      <div className="mock-papers__header">
        <div>
          <h1 className="mock-papers__title">Auditoria</h1>
          <p className="mock-papers__subtitle">
            Actividades registradas dentro del sistema
          </p>
        </div>

        <div className="mock-papers__search">
          <div className="input-group">
            <div className="input-search">
              <input
                type="text"
                className="input-field input-field--search"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagina(0);
                }}
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
          style={{ opacity: "0", cursor: "default" }}
          disabled
        >
          NUEVO <i className="fas fa-plus" />
        </button>
      </div>

      <div className="mock-papers__table-card">
        <div className="mock-papers__table-wrapper" ref={tableWrapperRef}>
          <table className="mock-papers__table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Pantalla</th>
                <th>Concepto</th>
              </tr>
            </thead>
            <tbody>
              {auditoriaPaginada.length > 0 ? (
                auditoriaPaginada.map((audi, index) => (
                  <tr key={audi.id} ref={index === 0 ? rowRef : null}>
                    <td>{String(inicio + index + 1).padStart(2, "0")}</td>
                    <td>{formatearFechaHora(audi.fecha)?.fecha}</td>
                    <td>{formatearFechaHora(audi.fecha)?.hora}</td>
                    <td>{audi.usuario}</td>
                    <td>{audi.accion}</td>
                    <td>{audi.pantalla}</td>
                    <td>{audi.concepto}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="busquedaSinresultado" colspan="9">
                    <i className="fa-solid fa-file-circle-exclamation"></i> Sin
                    Datos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mock-papers__pagination">
          <button
            className="mock-papers__arrow-btn"
            disabled={pagina === 0}
            onClick={() => setPagina((p) => Math.max(p - 1, 0))}
          >
            ←
          </button>
          <span className="mock-papers__page-btn">{pagina + 1}</span>/
          <span className="mock-papers__page-btn">{totalPaginas}</span>
          <button
            className="mock-papers__arrow-btn"
            disabled={pagina + 1 >= totalPaginas}
            onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas - 1))}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;
