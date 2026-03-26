import { useState, useRef, useEffect } from "react";
import { addToast } from "../components/Tooltip";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { sendData } from "../services/api";
import {
  editarProductos,
  eliminarProductos,
  grabarProductos,
  listarProductos,
} from "../services/urls";
import { calcRows } from "../components/Formatos";
import ModalDelete from "../components/ModalDelete";
import { useNavigate } from "react-router-dom";
import { NoEmpty } from "../components/NoEmpty";

const Productos = () => {
  const [pagina, setPagina] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [listProductos, setListProductos] = useState([]);
  const tableWrapperRef = useRef(null);
  const rowRef = useRef(null);
  const [modo, setModo] = useState("INS");
  const [filas, setFilas] = useState(8);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const { validate, clearErrors } = NoEmpty();
  const [tituloModal, setTituloModal] = useState("");
  const [descripcionEliminar, setDescripcionEliminar] = useState("");
  const navigate = useNavigate();
  const [producto, setProducto] = useState({
    codigo: "",
    nombre: "",
    marca: "",
    cantidad: "",
    precio: "",
    lote: "",
    vencimiento: "",
    fabricacion: "",
  });

  const getProductos = async () => {
    try {
      cargarLoader();
      const response = await sendData(listarProductos, "GET", null, null);
      if (response.status === 200) {
        setListProductos(response?.data);
        setTituloModal("");
        setDescripcionEliminar("");
        setVisible(false);
        setActiveTooltip(null);
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

  const handleChangeProductos = (event) => {
    setProducto((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const TooltipActions = ({ producto }) => {
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    const isActive = activeTooltip === producto;

    useEffect(() => {
      if (isActive && tooltipRef.current && triggerRef.current) {
        const tooltip = tooltipRef.current;
        const trigger = triggerRef.current;

        const triggerRect = trigger.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "1";
        tooltip.style.display = "block";

        const tooltipRect = tooltip.getBoundingClientRect();

        tooltip.style.visibility = "";
        tooltip.style.opacity = "";
        tooltip.style.display = "";
        tooltip.className = "tooltip-menu active";

        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        let top, left;

        if (spaceBelow >= tooltipRect.height + 16) {
          top = triggerRect.bottom + 8;
        } else if (spaceAbove >= tooltipRect.height + 16) {
          top = triggerRect.top - tooltipRect.height - 8;
        } else {
          if (spaceBelow > spaceAbove) {
            top = triggerRect.bottom + 8;
          } else {
            top = triggerRect.top - tooltipRect.height - 8;
          }
        }

        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        if (left < 20) left = 20;
        if (left + tooltipRect.width > viewportWidth - 20)
          left = viewportWidth - tooltipRect.width - 20;

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.transform = "none";
      }
    }, [isActive]);

    const handleToggle = (e) => {
      e.stopPropagation();
      setActiveTooltip(isActive ? null : producto);
    };

    const handleAction = (action) => {
      if (action === "Eliminar") {
        setTituloModal("Atención");
        setDescripcionEliminar(producto?.codigo + " - " + producto?.nombre);
        setVisible(true);
        setActiveTooltip(null);
        setProducto(producto);
      } else if (action === "Editar") {
        setActiveTooltip(null);
        setProducto(producto);
        setModo("UPD");
      }
    };

    return (
      <div className="tooltip-wrapper">
        <button
          ref={triggerRef}
          className="tooltip-trigger"
          onClick={handleToggle}
        >
          <i className="fas fa-ellipsis-v"></i>
        </button>

        <div
          ref={tooltipRef}
          className={`tooltip-menu ${isActive ? "active" : ""}`}
        >
          <button
            className="tooltip-item tooltip-item--edit"
            onClick={() => {
              handleAction("Editar");
              setOpenModal(true);
            }}
          >
            <i className="fas fa-edit"></i>
            <span>Editar</span>
          </button>

          <div className="tooltip-divider"></div>

          <button
            className="tooltip-item tooltip-item--delete"
            onClick={() => handleAction("Eliminar")}
          >
            <i className="fas fa-trash-alt"></i>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    );
  };

  const postProductos = async () => {
    clearErrors();
    if (!validate()) return;
    try {
      cargarLoader();
      const response = await sendData(
        modo === "INS" ? grabarProductos : editarProductos,
        "POST",
        null,
        producto,
      );
      if (response.status === 200) {
        await getProductos();
        addToast({
          type: "success",
          title: "Producto Grabado",
          message: response?.mensaje,
          duration: 3000,
        });
        setOpenModal(false);
        setTituloModal("");
        setDescripcionEliminar("");
        setVisible(false);
        setActiveTooltip(null);
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
  };

  useEffect(() => {
    if (tableWrapperRef.current && rowRef.current) {
      setFilas(calcRows(tableWrapperRef.current, rowRef.current));
    }
  }, [listProductos]);

  const eliminarProducto = async () => {
    try {
      cargarLoader();
      const response = await sendData(
        `${eliminarProductos}?codigo=${producto?.codigo}`,
        "DELETE",
        null,
        null,
      );
      if (response.status === 200) {
        addToast({
          type: "success",
          title: "Eliminado",
          message: response?.mensaje,
          duration: 3000,
        });
        await getProductos();
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
  };

  useEffect(() => {
    getProductos();
    const handleClickOutside = (e) => {
      if (!e.target.closest(".tooltip-wrapper")) setActiveTooltip(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const productosFiltrados = listProductos.filter((p) => {
    const texto = search.toLowerCase();
    return (
      p.codigo?.toLowerCase().includes(texto) ||
      p.nombre?.toLowerCase().includes(texto) ||
      p.marca?.toLowerCase().includes(texto) ||
      p.lote?.toLowerCase().includes(texto)
    );
  });

  const totalPaginas = Math.ceil(productosFiltrados.length / filas);
  const inicio = pagina * filas;
  const fin = inicio + filas;
  const productosPaginados = productosFiltrados.slice(inicio, fin);

  return (
    <>
      <ModalDelete
        visible={visible}
        setVisible={setVisible}
        titulo={tituloModal}
        eliminar={descripcionEliminar}
        funcion={eliminarProducto}
      />
      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Productos</h1>
            <p className="mock-papers__subtitle">
              Gestión y administración de productos odontológicos
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
            onClick={() => {
              setModo("INS");
              setProducto({
                codigo: "",
                nombre: "",
                marca: "",
                cantidad: "",
                precio: "",
                lote: "",
                vencimiento: "",
                fabricacion: "",
              });
              setOpenModal(true);
            }}
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
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosPaginados.length > 0 ? (
                  productosPaginados.map((p, index) => (
                    <tr key={p.codigo} ref={index === 0 ? rowRef : null}>
                      <td>{String(inicio + index + 1).padStart(2, "0")}</td>
                      <td>{p.codigo}</td>
                      <td>{p.nombre}</td>
                      <td>{p.marca}</td>
                      <td>{p.cantidad}</td>
                      <td>{p.precio}</td>
                      <td>
                        <TooltipActions producto={p} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="busquedaSinresultado" colSpan={7}>
                      <i className="fa-solid fa-file-circle-exclamation"></i>{" "}
                      Sin Datos
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
              onClick={() =>
                setPagina((p) => Math.min(p + 1, totalPaginas - 1))
              }
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div
        className="modal-overlay"
        style={{ display: openModal ? "flex" : "none" }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">Registro de Producto</h2>
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
                  name="codigo"
                  value={producto?.codigo}
                  onChange={handleChangeProductos}
                  disabled={modo === "UPD"}
                  noempty="true"
                  validar="Ingrese el código"
                  placeholder="Escribe aquí..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Nombre</label>
                <input
                  type="text"
                  className="input-field"
                  name="nombre"
                  value={producto?.nombre}
                  onChange={handleChangeProductos}
                  noempty="true"
                  validar="Ingrese el nombre"
                  placeholder="Escribe aquí..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Marca</label>
                <input
                  type="text"
                  className="input-field"
                  name="marca"
                  value={producto?.marca}
                  onChange={handleChangeProductos}
                  noempty="true"
                  validar="Ingrese la marca"
                  placeholder="Escribe aquí..."
                />
              </div>
            </div>
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Precio</label>
                <input
                  type="number"
                  className="input-field"
                  name="precio"
                  value={producto?.precio}
                  onChange={handleChangeProductos}
                  noempty="true"
                  validar="Ingrese el precio"
                  placeholder="Escribe aquí..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Cantidad</label>
                <input
                  type="number"
                  className="input-field"
                  name="cantidad"
                  value={producto?.cantidad}
                  onChange={handleChangeProductos}
                  noempty="true"
                  validar="Ingrese la cantidad"
                  placeholder="Escribe aquí..."
                />
              </div>
              <div className="input-group">
                <label className="input-label">Lote</label>
                <input
                  type="text"
                  className="input-field"
                  name="lote"
                  value={producto?.lote}
                  onChange={handleChangeProductos}
                  noempty="true"
                  validar="Ingrese el lote"
                  placeholder="Escribe aquí..."
                />
              </div>
            </div>
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Fecha Fabricación</label>
                <input
                  type="date"
                  className="input-field"
                  name="fabricacion"
                  value={producto?.fabricacion}
                  onChange={handleChangeProductos}
                  noempty="true"
                  validar="Ingrese la fecha de fabricación"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Fecha Vencimiento</label>
                <input
                  type="date"
                  className="input-field"
                  name="vencimiento"
                  value={producto?.vencimiento}
                  onChange={handleChangeProductos}
                  noempty="true"
                  validar="Ingrese la fecha de vencimiento"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setOpenModal(false)}>
              Cancelar
            </button>
            <button className="btn-submit" onClick={() => postProductos()}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Productos;
