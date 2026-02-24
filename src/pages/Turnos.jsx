import { useState, useRef, useEffect } from "react";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { useNavigate } from "react-router-dom";
import { sendData } from "../services/api";
import {
  editarTurnos,
  eliminarImagenTurno,
  eliminarTurnos,
  grabarTurnos,
  listarDoctores,
  listarImagenesTurno,
  listarPacientes,
  listarTurnos,
  recuperarTurno,
} from "../services/urls";
import { NoEmpty } from "../components/NoEmpty";
import ModalDelete from "../components/ModalDelete";

const Buscador = ({
  label,
  options,
  placeholder,
  value,
  onChange,
  labelExterno,
  onLabelChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(
    (option) =>
      option.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.apellido.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (labelExterno !== undefined) {
      setSelectedLabel(labelExterno);
    }
  }, [labelExterno]);

  useEffect(() => {
    if (!labelExterno && value && options.length > 0) {
      const encontrado = options.find((o) => (o.id || o.value) === value);
      if (encontrado) {
        setSelectedLabel(`${encontrado.nombre} ${encontrado.apellido}`);
      }
    }
    if (!value) {
      setSelectedLabel("");
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    const lbl = option.label || `${option.nombre} ${option.apellido}`;
    setSelectedLabel(lbl);
    onLabelChange && onLabelChange(lbl);
    onChange(option.id || option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div className="searchable-select" ref={dropdownRef}>
        <div className="select-input" onClick={() => setIsOpen(true)}>
          <input
            type="text"
            className="input-field search-input"
            placeholder={selectedLabel || placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          <svg
            className={`dropdown-arrow ${isOpen ? "open" : ""}`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {isOpen && (
          <div className="dropdown-menu">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id || option.value}
                  className={`dropdown-item ${value === (option.id || option.value) ? "selected" : ""}`}
                  onClick={() => handleSelect(option)}
                >
                  {value === (option.id || option.value) && (
                    <svg
                      className="check-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M13.3333 4L6 11.3333L2.66667 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {option.label || `${option.nombre} ${option.apellido}`}
                </div>
              ))
            ) : (
              <div className="dropdown-item no-results">
                No se encontraron resultados
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FileUpload = ({
  onFilesChange,
  imagenesExistentes = [],
  onEliminarImagen,
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e) => addFiles(Array.from(e.target.files));

  const addFiles = (newFiles) => {
    const filesWithProgress = newFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      uploading: true,
    }));

    setFiles((prev) => {
      const next = [...prev, ...filesWithProgress];
      onFilesChange && onFilesChange(next.map((f) => f.file));
      return next;
    });

    filesWithProgress.forEach((fileObj) => simulateUpload(fileObj.id));
  };

  const simulateUpload = (fileId) => {
    const interval = setInterval(() => {
      setFiles((prevFiles) =>
        prevFiles.map((f) => {
          if (f.id === fileId && f.progress < 100) {
            const newProgress = Math.min(f.progress + 10, 100);
            return {
              ...f,
              progress: newProgress,
              uploading: newProgress < 100,
            };
          }
          return f;
        }),
      );
    }, 200);
    setTimeout(() => clearInterval(interval), 2200);
  };

  const removeFile = (fileId) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== fileId);
      onFilesChange && onFilesChange(next.map((f) => f.file));
      return next;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = (fileName || "").split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "fa-file-pdf";
    if (["doc", "docx"].includes(ext)) return "fa-file-word";
    if (["xls", "xlsx"].includes(ext)) return "fa-file-excel";
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "fa-file-image";
    if (["zip", "rar", "7z"].includes(ext)) return "fa-file-archive";
    return "fa-file";
  };

  const getNombreArchivo = (url) => {
    if (!url) return "archivo";
    return url.split(/[\\/]/).pop();
  };

  return (
    <div className="file-upload">
      <div
        className={`file-upload__dropzone ${isDragging ? "file-upload__dropzone--dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="file-upload__icon">
          <i className="fas fa-cloud-upload-alt"></i>
        </div>
        <p className="file-upload__text">
          Adjunte sus archivos referente a la consulta del día
        </p>
        <p className="file-upload__subtext">
          Tamaño máximo por cada archivo 1MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>

      {imagenesExistentes.length > 0 && (
        <div className="file-upload__list">
          <p style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>
            Archivos existentes:
          </p>
          {imagenesExistentes.map((img) => (
            <div key={img.id} className="file-item">
              <div className="file-item__icon">
                <i className={`fas ${getFileIcon(img.url)}`}></i>
              </div>
              <div className="file-item__content">
                <div className="file-item__info">
                  <span className="file-item__name">
                    {getNombreArchivo(img.url)}
                  </span>
                </div>
              </div>
              <button
                className="file-item__delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onEliminarImagen && onEliminarImagen(img.id);
                }}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="file-upload__list">
          {imagenesExistentes.length > 0 && (
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>
              Nuevos archivos:
            </p>
          )}
          {files.map((fileObj) => (
            <div key={fileObj.id} className="file-item">
              <div className="file-item__icon">
                <i className={`fas ${getFileIcon(fileObj.file.name)}`}></i>
              </div>
              <div className="file-item__content">
                <div className="file-item__info">
                  <span className="file-item__name">{fileObj.file.name}</span>
                  <span className="file-item__size">
                    {fileObj.uploading
                      ? `${fileObj.progress}% of ${formatFileSize(fileObj.file.size)}`
                      : formatFileSize(fileObj.file.size)}
                  </span>
                </div>
                {fileObj.uploading && (
                  <div className="file-item__progress">
                    <div
                      className="file-item__progress-bar"
                      style={{ width: `${fileObj.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <button
                className="file-item__delete"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(fileObj.id);
                }}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FORM_VACIO = {
  id: 0,
  paciente: 0,
  doctor: 0,
  fecha: "",
  hora: "",
  estado: "Pendiente",
  tratamiento: "",
  observacion: "",
  descuentodoctor: 0,
  porcentajedescuento: 0,
  importetotal: 0,
};

const LABELS_VACIOS = {
  paciente: "",
  doctor: "",
  descuentodoctor: "",
};

const Turnos = () => {
  const userData = JSON.parse(localStorage.getItem("usuarioMaestro") || "{}");
  const navigate = useNavigate();
  const { validate, clearErrors } = NoEmpty();
  const [modo, setModo] = useState("INS");
  const tableWrapperRef = useRef(null);
  const rowRef = useRef(null);
  const [filas] = useState(8);
  const [search, setSearch] = useState("");
  const [turnos, setTurnos] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [listPacientes, setListPacientes] = useState([]);
  const [listDoctores, setListDoctores] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [visible, setVisible] = useState(false);
  const [turnoAEliminar, setTurnoAEliminar] = useState(null);
  const [descripcionEliminar, setDescripcionEliminar] = useState("");
  const [turnoForm, setTurnoForm] = useState(FORM_VACIO);
  const [labels, setLabels] = useState(LABELS_VACIOS);

  const handleChangeTurno = (e) => {
    setTurnoForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setTurnoForm(FORM_VACIO);
    setLabels(LABELS_VACIOS);
    setArchivos([]);
    setImagenesExistentes([]);
  };

  const getTurnos = async () => {
    try {
      cargarLoader();
      const response = await sendData(
        listarTurnos,
        "GET",
        `?rol=${userData?.role}&id=${userData?.id}`,
        null,
      );
      if (response.status === 200) {
        setActiveTooltip(null);
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

  const getPacientes = async () => {
    try {
      cargarLoader();
      const response = await sendData(listarPacientes, "GET", null, null);
      if (response.status === 200) {
        setListPacientes(response?.data);
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

  const getDoctores = async () => {
    try {
      cargarLoader();
      const response = await sendData(listarDoctores, "GET", null, null);
      if (response.status === 200) {
        setListDoctores(response?.data);
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

  const getImagenesTurno = async (idTurno) => {
    try {
      cargarLoader();
      const response = await sendData(
        listarImagenesTurno,
        "GET",
        `?idTurno=${idTurno}`,
        null,
      );
      if (response.status === 200) {
        setImagenesExistentes(response?.data || []);
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

  const buscarLabelEnLista = (lista, id) => {
    const encontrado = lista.find((o) => o.id === id);
    return encontrado ? `${encontrado.nombre} ${encontrado.apellido}` : "";
  };

  const abrirEditar = async (turno) => {
    try {
      cargarLoader();
      const response = await sendData(
        recuperarTurno,
        "GET",
        `?id=${turno.id}`,
        null,
      );
      if (response.status === 200) {
        console.log(response.data);
        const t = response.data;
        setTurnoForm({
          id: t.id,
          paciente: t.paciente,
          doctor: t.doctor,
          fecha: t.fecha,
          hora: t.hora,
          estado: t.estado,
          tratamiento: t.tratamiento,
          observacion: t.observacion,
          descuentodoctor: t.descuentodoctor,
          porcentajedescuento: t.porcentajedescuento,
          importetotal: t.importetotal,
        });
        setLabels({
          paciente: buscarLabelEnLista(listPacientes, t.paciente),
          doctor: buscarLabelEnLista(listDoctores, t.doctor),
          descuentodoctor: buscarLabelEnLista(listDoctores, t.descuentodoctor),
        });
        setArchivos([]);
        await getImagenesTurno(t.id);
        setModo("UPD");
        setOpenModal(true);
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

  const eliminarImagenExistente = async (idImagen) => {
    try {
      cargarLoader();

      const response = await fetch(`${eliminarImagenTurno}?id=${idImagen}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userData?.token || ""}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 200) {
        await getImagenesTurno(turnoForm.id);
        addToast({
          type: "success",
          title: "Eliminado",
          message: data?.mensaje,
          duration: 3000,
        });
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: data?.mensaje,
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
  const postTurno = async () => {
    clearErrors();
    if (!turnoForm.paciente) {
      addToast({
        type: "error",
        title: "Validación",
        message: "Seleccione un paciente",
        duration: 3000,
      });
      return;
    }
    if (!turnoForm.doctor) {
      addToast({
        type: "error",
        title: "Validación",
        message: "Seleccione un médico",
        duration: 3000,
      });
      return;
    }

    try {
      cargarLoader();

      const payload = {
        ...turnoForm,
        porcentajedescuento: Number(turnoForm.porcentajedescuento) || 0,
        importetotal: Number(turnoForm.importetotal) || 0,
      };

      const formData = new FormData();
      formData.append("turnos", JSON.stringify(payload));

      if (archivos.length > 0) {
        archivos.forEach((file) => formData.append("imagenes", file));
      } else {
        formData.append(
          "imagenes",
          new Blob([], { type: "application/octet-stream" }),
          "empty",
        );
      }

      const url = modo === "INS" ? grabarTurnos : editarTurnos;

      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${userData?.token || ""}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.status === 200) {
        addToast({
          type: "success",
          title: modo === "INS" ? "Turno Guardado" : "Turno Actualizado",
          message: data?.mensaje,
          duration: 3000,
        });
        setOpenModal(false);
        resetForm();
        await getTurnos();
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: data?.mensaje,
          duration: 3000,
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: String(error),
        duration: 3000,
      });
    } finally {
      ocultarLoader();
    }
  };

  const eliminarTurnoFn = async () => {
    try {
      cargarLoader();

      const response = await fetch(
        `${eliminarTurnos}?id=${turnoAEliminar?.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userData?.token || ""}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok && data.status === 200) {
        addToast({
          type: "success",
          title: "Eliminado",
          message: data?.mensaje,
          duration: 3000,
        });
        setVisible(false);
        setTurnoAEliminar(null);
        await getTurnos();
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: data?.mensaje,
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
  const getEstadoClass = (estado) => {
    switch (estado?.toUpperCase()) {
      case "CONFIRMADO":
        return "turno-estado--confirmado";
      case "PENDIENTE":
        return "turno-estado--pendiente";
      case "CANCELADO":
        return "turno-estado--cancelado";
      default:
        return "";
    }
  };

  const TooltipActions = ({ turno }) => {
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    const isActive = activeTooltip === turno.id;

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

        let top =
          spaceBelow >= tooltipRect.height + 16
            ? triggerRect.bottom + 8
            : spaceAbove >= tooltipRect.height + 16
              ? triggerRect.top - tooltipRect.height - 8
              : spaceBelow > spaceAbove
                ? triggerRect.bottom + 8
                : triggerRect.top - tooltipRect.height - 8;

        let left =
          triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
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
      setActiveTooltip(isActive ? null : turno.id);
    };

    const handleAction = (action) => {
      setActiveTooltip(null);
      if (action === "Editar") {
        abrirEditar(turno);
      } else if (action === "Eliminar") {
        setTurnoAEliminar(turno);
        setDescripcionEliminar(`Turno de ${turno.paciente} - ${turno.fecha}`);
        setVisible(true);
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
            onClick={() => handleAction("Editar")}
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

  useEffect(() => {
    getTurnos();
    getPacientes();
    getDoctores();
    const handleClickOutside = (e) => {
      if (!e.target.closest(".tooltip-wrapper")) setActiveTooltip(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const turnosFiltrados = (turnos || []).filter((t) => {
    const busqueda = search.toLowerCase();
    return (
      String(t.paciente || "")
        .toLowerCase()
        .includes(busqueda) ||
      String(t.doctor || "")
        .toLowerCase()
        .includes(busqueda) ||
      String(t.tratamiento || "")
        .toLowerCase()
        .includes(busqueda) ||
      String(t.estado || "")
        .toLowerCase()
        .includes(busqueda)
    );
  });

  const totalPaginas = Math.ceil(turnosFiltrados.length / filas) || 1;
  const inicio = pagina * filas;
  const turnosPaginados = turnosFiltrados.slice(inicio, inicio + filas);

  return (
    <>
      <ModalDelete
        visible={visible}
        setVisible={setVisible}
        titulo="Atención"
        eliminar={descripcionEliminar}
        funcion={eliminarTurnoFn}
      />

      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Turnos</h1>
            <p className="mock-papers__subtitle">
              Gestiona los turnos y citas de tus pacientes
            </p>
          </div>
          <div className="mock-papers__search">
            <input
              type="text"
              className="input-field input-field--search"
              placeholder="Buscar por paciente o médico..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagina(0);
              }}
            />
          </div>
          <button
            className="mock-papers__upload-btn"
            onClick={() => {
              setModo("INS");
              resetForm();
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
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Tratamiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnosPaginados.length > 0 ? (
                  turnosPaginados.map((turno, index) => (
                    <tr key={turno.id} ref={index === 0 ? rowRef : null}>
                      <td>{String(inicio + index + 1).padStart(2, "0")}</td>
                      <td>{turno.paciente}</td>
                      <td>{turno.doctor}</td>
                      <td>{turno.fecha}</td>
                      <td>{turno.hora}</td>
                      <td>{turno.tratamiento}</td>
                      <td>
                        <span
                          className={`turno-estado ${getEstadoClass(turno.estado)}`}
                        >
                          {turno.estado}
                        </span>
                      </td>
                      <td>
                        <TooltipActions turno={turno} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="busquedaSinresultado" colSpan={8}>
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
            <h2 className="modal-title">
              {modo === "INS" ? "Nuevo" : "Modificar"} Turno
            </h2>
            <button className="modal-close" onClick={() => setOpenModal(false)}>
              &times;
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-row">
              <Buscador
                label="Paciente"
                options={listPacientes}
                placeholder="Seleccionar paciente"
                value={turnoForm.paciente}
                labelExterno={labels.paciente}
                onLabelChange={(lbl) =>
                  setLabels((prev) => ({ ...prev, paciente: lbl }))
                }
                onChange={(val) =>
                  setTurnoForm((prev) => ({ ...prev, paciente: val }))
                }
              />
              <Buscador
                label="Médico"
                options={listDoctores}
                placeholder="Seleccionar médico"
                value={turnoForm.doctor}
                labelExterno={labels.doctor}
                onLabelChange={(lbl) =>
                  setLabels((prev) => ({ ...prev, doctor: lbl }))
                }
                onChange={(val) =>
                  setTurnoForm((prev) => ({ ...prev, doctor: val }))
                }
              />
              <div className="input-group">
                <label className="input-label">Fecha</label>
                <input
                  type="date"
                  className="input-field"
                  name="fecha"
                  value={turnoForm.fecha}
                  onChange={handleChangeTurno}
                  noempty="true"
                  validar="Ingrese la fecha del turno"
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Hora</label>
                <input
                  type="time"
                  className="input-field"
                  name="hora"
                  value={turnoForm.hora}
                  onChange={handleChangeTurno}
                  noempty="true"
                  validar="Ingrese la hora del turno"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Estado</label>
                <select
                  className="input-select"
                  name="estado"
                  value={turnoForm.estado}
                  onChange={handleChangeTurno}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Tratamiento</label>
                <input
                  type="text"
                  className="input-field"
                  name="tratamiento"
                  value={turnoForm.tratamiento}
                  onChange={handleChangeTurno}
                  noempty="true"
                  validar="Ingrese el tratamiento, es importante para el historial del paciente"
                  placeholder="Ej: Limpieza dental, Extracción, etc."
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Observaciones</label>
                <textarea
                  className="input-textarea"
                  name="observacion"
                  value={turnoForm.observacion}
                  onChange={handleChangeTurno}
                  placeholder="Notas adicionales sobre el turno, productos utilizados etc..."
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="modal-row">
              <Buscador
                label="Descontar al Médico"
                options={listDoctores}
                placeholder="Seleccionar médico"
                value={turnoForm.descuentodoctor}
                labelExterno={labels.descuentodoctor}
                onLabelChange={(lbl) =>
                  setLabels((prev) => ({ ...prev, descuentodoctor: lbl }))
                }
                onChange={(val) =>
                  setTurnoForm((prev) => ({ ...prev, descuentodoctor: val }))
                }
              />
              <div className="input-group">
                <label className="input-label">Porcentaje a descontar</label>
                <input
                  type="text"
                  className="input-field"
                  value={turnoForm.porcentajedescuento || ""}
                  onChange={(e) =>
                    setTurnoForm((prev) => ({
                      ...prev,
                      porcentajedescuento: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="input-group">
                <label className="input-label">Importe Total</label>
                <input
                  type="text"
                  className="input-field"
                  value={turnoForm.importetotal || ""}
                  onChange={(e) =>
                    setTurnoForm((prev) => ({
                      ...prev,
                      importetotal: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Carga de Almacenamiento</label>
                <FileUpload
                  onFilesChange={setArchivos}
                  imagenesExistentes={imagenesExistentes}
                  onEliminarImagen={eliminarImagenExistente}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setOpenModal(false)}>
              Cancelar
            </button>
            <button className="btn-submit" onClick={postTurno}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Turnos;
