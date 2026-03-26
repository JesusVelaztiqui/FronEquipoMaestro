import { useState, useRef, useEffect, useMemo } from "react";
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

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DIAS_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS_LARGO = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const parseLocalDate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const estadoCalClass = (estado) => {
  switch ((estado || "").toUpperCase()) {
    case "CONFIRMADO":
      return "confirmado";
    case "CANCELADO":
      return "cancelado";
    default:
      return "pendiente";
  }
};

const formatNumerico = (valor) => {
  if (!valor && valor !== 0) return "";
  const num = String(valor).replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("es-PY");
};

const desformatear = (valor) => {
  return Number(String(valor).replace(/\D/g, "")) || 0;
};

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
    if (labelExterno !== undefined) setSelectedLabel(labelExterno);
  }, [labelExterno]);

  useEffect(() => {
    if (!labelExterno && value && options.length > 0) {
      const encontrado = options.find((o) => (o.id || o.value) === value);
      if (encontrado)
        setSelectedLabel(`${encontrado.nombre} ${encontrado.apellido}`);
    }
    if (!value) setSelectedLabel("");
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

const LABELS_VACIOS = { paciente: "", doctor: "", descuentodoctor: "" };

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
  const [importeDisplay, setImporteDisplay] = useState("");

  const [vista, setVista] = useState(
    () => localStorage.getItem("turnos_vista") || "lista",
  );

  const cambiarVista = (v) => {
    localStorage.setItem("turnos_vista", v);
    setVista(v);
  };

  const hoy = new Date();
  const hoyKey = formatKey(hoy);
  const [calMes, setCalMes] = useState(hoy.getMonth());
  const [calAnio, setCalAnio] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const handleChangeTurno = (e) => {
    const { name, value } = e.target;

    if (name === "fecha") {
      if (value < hoyKey) {
        addToast({
          type: "warning",
          title: "Fecha inválida",
          message: "No se puede agendar un turno en una fecha anterior a hoy.",
          duration: 3000,
        });
        return;
      }
      if (turnoForm.estado === "Confirmado" && value > hoyKey) {
        addToast({
          type: "warning",
          title: "Estado inválido",
          message: "No se puede confirmar un turno con fecha futura.",
          duration: 3000,
        });
        setTurnoForm((prev) => ({
          ...prev,
          [name]: value,
          estado: "Pendiente",
        }));
        return;
      }
    }

    if (name === "estado" && value === "Confirmado") {
      const fechaTurno = turnoForm.fecha;
      if (fechaTurno && fechaTurno > hoyKey) {
        addToast({
          type: "warning",
          title: "Estado inválido",
          message:
            "Solo se puede confirmar un turno en el día o después de la fecha del turno.",
          duration: 3000,
        });
        return;
      }
    }

    setTurnoForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setTurnoForm(FORM_VACIO);
    setLabels(LABELS_VACIOS);
    setArchivos([]);
    setImagenesExistentes([]);
    setImporteDisplay("");
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
      if (response.status === 200) setImagenesExistentes(response?.data || []);
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
        setImporteDisplay(formatNumerico(t.importetotal));
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
        headers: { Authorization: `Bearer ${userData?.token || ""}` },
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
    if (!validate()) return;
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
    if (turnoForm.fecha < hoyKey) {
      addToast({
        type: "error",
        title: "Validación",
        message: "No se puede agendar un turno en una fecha anterior a hoy.",
        duration: 3000,
      });
      return;
    }
    if (turnoForm.estado === "Confirmado" && turnoForm.fecha > hoyKey) {
      addToast({
        type: "error",
        title: "Validación",
        message:
          "Solo se puede confirmar un turno en el día o después de la fecha del turno.",
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
          headers: { Authorization: `Bearer ${userData?.token || ""}` },
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

  const abrirEliminar = (turno) => {
    setTurnoAEliminar(turno);
    setDescripcionEliminar(`Turno de ${turno.paciente} - ${turno.fecha}`);
    setVisible(true);
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
      if (action === "Editar") abrirEditar(turno);
      else if (action === "Eliminar") abrirEliminar(turno);
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
    const b = search.toLowerCase();
    return (
      String(t.paciente || "")
        .toLowerCase()
        .includes(b) ||
      String(t.doctor || "")
        .toLowerCase()
        .includes(b) ||
      String(t.tratamiento || "")
        .toLowerCase()
        .includes(b) ||
      String(t.estado || "")
        .toLowerCase()
        .includes(b)
    );
  });

  const totalPaginas = Math.ceil(turnosFiltrados.length / filas) || 1;
  const inicio = pagina * filas;
  const turnosPaginados = turnosFiltrados.slice(inicio, inicio + filas);

  const turnosPorDia = useMemo(() => {
    const mapa = {};
    turnos.forEach((t) => {
      const key = t.fecha;
      if (!mapa[key]) mapa[key] = [];
      mapa[key].push(t);
    });
    Object.values(mapa).forEach((arr) =>
      arr.sort((a, b) => (a.hora || "").localeCompare(b.hora || "")),
    );
    return mapa;
  }, [turnos]);

  const calCeldas = useMemo(() => {
    const primerDia = new Date(calAnio, calMes, 1);
    const diasEnMes = new Date(calAnio, calMes + 1, 0).getDate();
    const offset = primerDia.getDay();
    const total = Math.ceil((offset + diasEnMes) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const dia = i - offset + 1;
      if (dia < 1 || dia > diasEnMes) return null;
      return formatKey(new Date(calAnio, calMes, dia));
    });
  }, [calMes, calAnio]);

  const navCalMes = (delta) => {
    let m = calMes + delta;
    let a = calAnio;
    if (m < 0) {
      m = 11;
      a--;
    }
    if (m > 11) {
      m = 0;
      a++;
    }
    setCalMes(m);
    setCalAnio(a);
  };

  const turnosDrawer = diaSeleccionado
    ? turnosPorDia[diaSeleccionado] || []
    : [];

  const formatFechaDrawer = (key) => {
    const d = parseLocalDate(key);
    if (!d) return key;
    return `${DIAS_LARGO[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  };

  const abrirNuevoCon = (fecha) => {
    if (fecha < hoyKey) {
      addToast({
        type: "warning",
        title: "Fecha inválida",
        message: "No se puede agendar un turno en una fecha anterior a hoy.",
        duration: 3000,
      });
      return;
    }
    setModo("INS");
    resetForm();
    setTurnoForm((prev) => ({ ...prev, fecha }));
    setOpenModal(true);
  };

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

          <div className="view-toggle">
            <button
              className={`view-toggle__btn ${vista === "lista" ? "active" : ""}`}
              onClick={() => cambiarVista("lista")}
            >
              <i className="fas fa-list" /> Lista
            </button>
            <button
              className={`view-toggle__btn ${vista === "calendario" ? "active" : ""}`}
              onClick={() => cambiarVista("calendario")}
            >
              <i className="fas fa-calendar-alt" /> Calendario
            </button>
          </div>

          {vista === "lista" && (
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
          )}

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

        {vista === "lista" && (
          <div className="mock-papers__table-card">
            <div className="mock-papers__table-wrapper" ref={tableWrapperRef}>
              <table className="mock-papers__table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Id turno</th>
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
                        <td>{turno.id}</td>
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
                      <td className="busquedaSinresultado" colSpan={9}>
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
        )}

        {vista === "calendario" && (
          <div className="cal-wrapper">
            <div className="cal-nav">
              <h2 className="cal-nav__title">
                {MESES[calMes]} <span>{calAnio}</span>
              </h2>
              <div className="cal-nav__right">
                <div className="cal-legend">
                  <div className="cal-legend__item">
                    <div className="cal-legend__dot cal-legend__dot--pendiente" />
                    Pendiente
                  </div>
                  <div className="cal-legend__item">
                    <div className="cal-legend__dot cal-legend__dot--confirmado" />
                    Confirmado
                  </div>
                  <div className="cal-legend__item">
                    <div className="cal-legend__dot cal-legend__dot--cancelado" />
                    Cancelado
                  </div>
                </div>
                <div className="cal-nav__controls">
                  <button
                    className="cal-nav__today"
                    onClick={() => {
                      setCalMes(hoy.getMonth());
                      setCalAnio(hoy.getFullYear());
                    }}
                  >
                    Hoy
                  </button>
                  <button
                    className="cal-nav__btn"
                    onClick={() => navCalMes(-1)}
                  >
                    <i className="fas fa-chevron-left" />
                  </button>
                  <button className="cal-nav__btn" onClick={() => navCalMes(1)}>
                    <i className="fas fa-chevron-right" />
                  </button>
                </div>
              </div>
            </div>

            <div className="cal-grid">
              {DIAS_CORTO.map((d) => (
                <div key={d} className="cal-weekday">
                  {d}
                </div>
              ))}
              {calCeldas.map((key, idx) => {
                if (!key)
                  return (
                    <div key={`v-${idx}`} className="cal-day cal-day--vacio" />
                  );
                const d = parseLocalDate(key);
                const esHoy = hoyKey === key;
                const esPasado = key < hoyKey;
                const lista = turnosPorDia[key] || [];
                const MAX = 2;
                return (
                  <div
                    key={key}
                    className={[
                      "cal-day",
                      esHoy ? "cal-day--hoy" : "",
                      esPasado ? "cal-day--pasado" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setDiaSeleccionado(key)}
                  >
                    <div className="cal-day__num">{d.getDate()}</div>
                    <div className="cal-day__chips">
                      {lista.slice(0, MAX).map((t) => (
                        <div
                          key={t.id}
                          className={`cal-chip cal-chip--${estadoCalClass(t.estado)}`}
                          title={`${t.hora} — ${t.paciente}`}
                        >
                          <div className="cal-chip__dot" />
                          <span className="cal-chip__hora">{t.hora}</span>
                          <span className="cal-chip__nombre">{t.paciente}</span>
                        </div>
                      ))}
                      {lista.length > MAX && (
                        <div className="cal-day__mas">
                          +{lista.length - MAX} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {diaSeleccionado && (
        <>
          <div
            className="cal-drawer-overlay"
            onClick={() => setDiaSeleccionado(null)}
          />
          <div className="cal-drawer">
            <div className="cal-drawer__header">
              <div>
                <div className="cal-drawer__titulo">Turnos del día</div>
                <div className="cal-drawer__fecha-txt">
                  {formatFechaDrawer(diaSeleccionado)}
                </div>
              </div>
              <button
                className="cal-drawer__close"
                onClick={() => setDiaSeleccionado(null)}
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="cal-drawer__body">
              {turnosDrawer.length === 0 ? (
                <div className="cal-drawer__vacio">
                  <i className="fas fa-calendar-times" />
                  Sin turnos programados
                </div>
              ) : (
                turnosDrawer.map((t) => (
                  <div key={t.id} className="cal-card">
                    <div className="cal-card__top">
                      <span className="cal-card__hora">{t.hora}</span>
                      <span
                        className={`cal-card__badge cal-card__badge--${estadoCalClass(t.estado)}`}
                      >
                        {t.estado}
                      </span>
                    </div>
                    <div className="cal-card__row">
                      <i className="fas fa-user" />
                      <div>
                        <span className="cal-card__lbl">Paciente</span>
                        {t.paciente}
                      </div>
                    </div>
                    <div className="cal-card__row">
                      <i className="fas fa-stethoscope" />
                      <div>
                        <span className="cal-card__lbl">Médico</span>
                        {t.doctor}
                      </div>
                    </div>
                    {t.tratamiento && (
                      <div className="cal-card__row">
                        <i className="fas fa-tooth" />
                        <div>
                          <span className="cal-card__lbl">Tratamiento</span>
                          {t.tratamiento}
                        </div>
                      </div>
                    )}
                    {t.observacion && (
                      <div className="cal-card__row">
                        <i className="fas fa-sticky-note" />
                        <div>
                          <span className="cal-card__lbl">Observación</span>
                          {t.observacion}
                        </div>
                      </div>
                    )}
                    <div className="cal-card__actions">
                      <button
                        className="cal-card__btn"
                        onClick={() => {
                          setDiaSeleccionado(null);
                          abrirEditar(t);
                        }}
                      >
                        <i className="fas fa-edit" /> Editar
                      </button>
                      <button
                        className="cal-card__btn cal-card__btn--del"
                        onClick={() => {
                          setDiaSeleccionado(null);
                          abrirEliminar(t);
                        }}
                      >
                        <i className="fas fa-trash-alt" /> Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
              <button
                className="cal-drawer__add"
                onClick={() => {
                  setDiaSeleccionado(null);
                  abrirNuevoCon(diaSeleccionado);
                }}
              >
                <i className="fas fa-plus" /> Nuevo turno en este día
              </button>
            </div>
          </div>
        </>
      )}

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
                  min={hoyKey}
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
                  <option
                    value="Confirmado"
                    disabled={turnoForm.fecha > hoyKey}
                  >
                    Confirmado
                  </option>
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
                  validar="Ingrese el tratamiento"
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
                />
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
                  type="number"
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
                  value={importeDisplay}
                  onChange={(e) => {
                    const raw = desformatear(e.target.value);
                    setImporteDisplay(formatNumerico(raw));
                    setTurnoForm((prev) => ({ ...prev, importetotal: raw }));
                  }}
                  placeholder="0"
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
