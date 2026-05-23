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
  listarTratamientoPorPaciente,
  recuperarTurno,
} from "../services/urls";
import { NoEmpty } from "../components/NoEmpty";
import ModalDelete from "../components/ModalDelete";
import { formatoFecha } from "../components/Formatos";

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
    case "ATENDIDO":
      return "atendido";
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
            placeholder={placeholder}
            value={isOpen ? searchTerm : selectedLabel}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => { setSearchTerm(""); setIsOpen(true); }}
            onBlur={() =>
              setTimeout(() => {
                setIsOpen(false);
                setSearchTerm("");
              }, 150)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredOptions.length === 1) {
                e.preventDefault();
                handleSelect(filteredOptions[0]);
                const focusable = Array.from(
                  document.querySelectorAll(
                    'input:not([disabled]):not([readonly]):not([type="hidden"]), select:not([disabled])',
                  ),
                ).filter((el) => {
                  if (
                    ["submit", "button", "reset", "checkbox", "radio"].includes(
                      el.type,
                    )
                  )
                    return false;
                  const r = el.getBoundingClientRect();
                  return r.width > 0 && r.height > 0;
                });
                const idx = focusable.indexOf(e.target);
                if (idx >= 0 && idx < focusable.length - 1) {
                  focusable[idx + 1].focus();
                }
              }
            }}
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
          <div className="dropdown-menu" onMouseDown={(e) => e.preventDefault()}>
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

const TimePicker = ({ value, onChange, name, minTime }) => {
  const handleKeyDown = (e) => {
    if (["Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      const digits = (value || "").replace(":", "");
      const newDigits = digits.slice(0, -1);
      let formatted = newDigits;
      if (newDigits.length > 2) formatted = newDigits.slice(0, 2) + ":" + newDigits.slice(2);
      onChange({ target: { name, value: formatted } });
      return;
    }

    if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }

    e.preventDefault();
    const digits = (value || "").replace(":", "");
    // si ya está completo, el nuevo dígito reinicia
    const base = digits.length >= 4 ? "" : digits;
    const newDigits = base + e.key;
    if (newDigits.length >= 2 && parseInt(newDigits.slice(0, 2)) > 23) return;
    if (newDigits.length >= 4 && parseInt(newDigits.slice(2, 4)) > 59) return;

    let formatted = newDigits;
    if (newDigits.length > 2) formatted = newDigits.slice(0, 2) + ":" + newDigits.slice(2);
    onChange({ target: { name, value: formatted } });
  };

  const handleBlur = () => {
    const digits = (value || "").replace(":", "");
    let completed = value || "";

    if (digits.length > 0 && digits.length < 4) {
      let h, m;
      if (digits.length === 1) {
        h = "0" + digits;
        m = "00";
      } else if (digits.length === 2) {
        h = digits;
        m = "00";
      } else {
        h = digits.slice(0, 2);
        const mTens = parseInt(digits[2]);
        m = mTens <= 5 ? digits[2] + "0" : "0" + digits[2];
      }
      const hNum = parseInt(h), mNum = parseInt(m);
      completed = hNum <= 23 && mNum <= 59 ? `${h}:${m}` : "";
    }

    let final = completed;
    if (minTime && final && final.length === 5 && final < minTime) final = minTime;
    if (final !== (value || "")) onChange({ target: { name, value: final } });
  };

  return (
    <input
      type="text"
      className="input-field"
      placeholder="HH:MM"
      value={(value || "").slice(0, 5)}
      onKeyDown={handleKeyDown}
      onChange={() => {}}
      onBlur={handleBlur}
      maxLength={5}
    />
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
  tratamiento: 0,
  observacion: "",
  descuentodoctor: 0,
  doctor2: 0,
  porcentajedescuento: 0,
  importetotal: 0,
  importerecibido: 0,
  importelaboratorio: 0,
  saldo: 0,
  consultorio: 0,
  horahasta: "",
};

const LABELS_VACIOS = { paciente: "", doctor: "", doctor2: "", tratamiento: "" };

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
  const [listTratamientos, setListTratamientos] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [visible, setVisible] = useState(false);
  const [turnoAEliminar, setTurnoAEliminar] = useState(null);
  const [descripcionEliminar, setDescripcionEliminar] = useState("");
  const [turnoForm, setTurnoForm] = useState(FORM_VACIO);
  const [labels, setLabels] = useState(LABELS_VACIOS);
  const [importeDisplay, setImporteDisplay] = useState("");
  const [importeRecibidoDisplay, setImporteRecibidoDisplay] = useState("");
  const [importeLaboratorioDisplay, setImporteLaboratorioDisplay] = useState("");
  const [fechaOriginal, setFechaOriginal] = useState("");
  const [estadoOriginal, setEstadoOriginal] = useState("");
  const [saldoDisponible, setSaldoDisponible] = useState(null);

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
  const [calFiltroConsultorio, setCalFiltroConsultorio] = useState(0);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const normFecha = (f) => {
    if (!f) return "";
    if (Array.isArray(f)) {
      const [y, m, d] = f;
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return String(f).substring(0, 10);
  };

  const normHora = (h) => {
    if (!h) return "";
    if (Array.isArray(h)) {
      const [hh, mm = 0] = h;
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }
    return String(h).slice(0, 5);
  };

  const sumarUnaHora = (hhMM) => {
    if (!hhMM || hhMM.length < 5) return "";
    const [h, m] = hhMM.split(":").map(Number);
    const nh = (h + 1) % 24;
    return `${String(nh).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // true si el doctor participa en ese turno (como doctor principal o como doctor2)
  const doctorEnTurno = (t, doctorId) =>
    String(t.doctor) === String(doctorId) ||
    (t.doctor2 && String(t.doctor2) === String(doctorId));

  const calcularProximaHora = (fecha) => {
    if (!fecha || !turnoForm.doctor) return "";
    const fechaNorm = normFecha(fecha);
    const turnosDia = turnos.filter((t) =>
      normFecha(t.fecha) === fechaNorm &&
      (t.estado || "").toLowerCase() !== "cancelado" &&
      doctorEnTurno(t, turnoForm.doctor)
    );
    if (turnosDia.length === 0) return "";
    let maxFin = "";
    for (const t of turnosDia) {
      const desde = normHora(t.hora);
      const hasta = normHora(t.horahasta);
      const fin = hasta && hasta > desde ? hasta : sumarUnaHora(desde);
      if (fin > maxFin) maxFin = fin;
    }
    return maxFin;
  };

  const proximaHoraDisponible = modo === "INS" ? calcularProximaHora(turnoForm.fecha) : null;

  const handleChangeTurno = (e) => {
    const { name, value } = e.target;

    if (name === "fecha") {
      if (modo === "UPD" && estadoOriginal === "Confirmado") {
        addToast({
          type: "warning",
          title: "Fecha bloqueada",
          message: "No se puede modificar la fecha de un turno ya confirmado.",
          duration: 3000,
        });
        return;
      }
      if (modo === "INS" && value < hoyKey) {
        addToast({
          type: "warning",
          title: "Fecha inválida",
          message: "No se puede agendar un turno en una fecha anterior a hoy.",
          duration: 3000,
        });
        return;
      }
      if (modo === "UPD" && estadoOriginal !== "Confirmado") {
        const minFecha =
          fechaOriginal && fechaOriginal < hoyKey ? fechaOriginal : hoyKey;
        if (value < minFecha) {
          addToast({
            type: "warning",
            title: "Fecha inválida",
            message:
              "La nueva fecha no puede ser anterior a la fecha original del turno.",
            duration: 3000,
          });
          return;
        }
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
      if (modo === "INS") {
        setTurnoForm((prev) => ({ ...prev, fecha: value }));
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
    setImporteRecibidoDisplay("");
    setImporteLaboratorioDisplay("");
    setFechaOriginal("");
    setEstadoOriginal("");
    setListTratamientos([]);
    setSaldoDisponible(null);
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

  const getTratamientosPorPaciente = async (pacienteId) => {
    if (!pacienteId) { setListTratamientos([]); return []; }
    try {
      const response = await sendData(listarTratamientoPorPaciente, "GET", `?paciente=${pacienteId}`, null);
      if (response.status === 200) {
        setListTratamientos(response.data || []);
        return response.data || [];
      }
    } catch { /* silencioso */ }
    return [];
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
        setFechaOriginal(t.fecha);
        setEstadoOriginal(t.estado);
        setTurnoForm({
          id: t.id,
          paciente: t.paciente,
          doctor: t.doctor,
          fecha: t.fecha,
          hora: String(t.hora || "").slice(0, 5),
          estado: t.estado,
          tratamiento: t.tratamiento,
          observacion: t.observacion,
          descuentodoctor: 0,
          doctor2: t.doctor2 || 0,
          porcentajedescuento: t.porcentajedescuento,
          importetotal: t.importetotal,
          importerecibido: t.importerecibido || 0,
          importelaboratorio: t.importelaboratorio || 0,
          saldo: t.saldo || 0,
          consultorio: t.consultorio || 0,
          horahasta: String(t.horahasta || "").slice(0, 5),
        });
        setImporteRecibidoDisplay(formatNumerico(t.importerecibido || 0));
        setImporteLaboratorioDisplay(formatNumerico(t.importelaboratorio || 0));
        const tratamientosDelPaciente = await getTratamientosPorPaciente(t.paciente);
        const tratEncontrado = tratamientosDelPaciente.find((tr) => tr.id === t.tratamiento);
        const importetotalReal = tratEncontrado ? tratEncontrado.importetotal : 0;
        setTurnoForm((prev) => ({ ...prev, importetotal: importetotalReal }));
        setImporteDisplay(formatNumerico(importetotalReal));
        setLabels({
          paciente: buscarLabelEnLista(listPacientes, t.paciente),
          doctor: buscarLabelEnLista(listDoctores, t.doctor),
          doctor2: t.doctor2 ? buscarLabelEnLista(listDoctores, t.doctor2) : "",
          tratamiento: tratEncontrado ? tratEncontrado.descripcion : "",
        });
        setSaldoDisponible(
          tratEncontrado ? tratEncontrado.saldo + (t.importerecibido || 0) : null
        );
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
        message: "Seleccione un dr",
        duration: 3000,
      });
      return;
    }
    if (!turnoForm.hora) {
      addToast({
        type: "error",
        title: "Validación",
        message: "Ingrese la hora del turno",
        duration: 3000,
      });
      return;
    }
    if (!turnoForm.consultorio) {
      addToast({
        type: "error",
        title: "Validación",
        message: "Ingrese el número de consultorio",
        duration: 3000,
      });
      return;
    }
    if (saldoDisponible !== null && Number(turnoForm.importerecibido) > saldoDisponible) {
      addToast({
        type: "error",
        title: "Validación",
        message: `El importe recibido supera el saldo pendiente de ${Number(saldoDisponible).toLocaleString("es-PY")} Gs.`,
        duration: 3000,
      });
      return;
    }
    if (modo === "INS" && turnoForm.fecha < hoyKey) {
      addToast({
        type: "error",
        title: "Validación",
        message: "No se puede agendar un turno en una fecha anterior a hoy.",
        duration: 3000,
      });
      return;
    }
    if (
      modo === "UPD" &&
      estadoOriginal === "Confirmado" &&
      turnoForm.fecha !== fechaOriginal
    ) {
      addToast({
        type: "error",
        title: "Validación",
        message: "No se puede modificar la fecha de un turno ya confirmado.",
        duration: 3000,
      });
      return;
    }
    if (modo === "UPD" && estadoOriginal !== "Confirmado") {
      const minFecha =
        fechaOriginal && fechaOriginal < hoyKey ? fechaOriginal : hoyKey;
      if (turnoForm.fecha < minFecha) {
        addToast({
          type: "error",
          title: "Validación",
          message:
            "La nueva fecha no puede ser anterior a la fecha original del turno.",
          duration: 3000,
        });
        return;
      }
    }
    // Validar que ningún doctor se encime con otro turno
    if (turnoForm.fecha && turnoForm.hora) {
      const horaDesde = turnoForm.hora;
      const horaHasta = turnoForm.horahasta && turnoForm.horahasta > turnoForm.hora
        ? turnoForm.horahasta
        : sumarUnaHora(turnoForm.hora);

      const turnosConflicto = turnos.filter((t) => {
        if ((t.estado || "").toLowerCase() === "cancelado") return false;
        if (normFecha(t.fecha) !== turnoForm.fecha) return false;
        if (modo === "UPD" && t.id === turnoForm.id) return false;
        const tDesde = normHora(t.hora);
        const tHasta = normHora(t.horahasta) && normHora(t.horahasta) > tDesde
          ? normHora(t.horahasta)
          : sumarUnaHora(tDesde);
        return horaDesde < tHasta && horaHasta > tDesde;
      });

      if (turnoForm.doctor) {
        const c = turnosConflicto.find((t) => doctorEnTurno(t, turnoForm.doctor));
        if (c) {
          addToast({
            type: "error",
            title: "Doctor ocupado",
            message: `El doctor ya tiene un turno de ${normHora(c.hora)} a ${normHora(c.horahasta) || sumarUnaHora(normHora(c.hora))}`,
            duration: 4000,
          });
          return;
        }
      }

      if (turnoForm.doctor2 && Number(turnoForm.doctor2) !== 0) {
        const c = turnosConflicto.find((t) => doctorEnTurno(t, turnoForm.doctor2));
        if (c) {
          addToast({
            type: "error",
            title: "Segundo doctor ocupado",
            message: `El segundo doctor ya tiene un turno de ${normHora(c.hora)} a ${normHora(c.horahasta) || sumarUnaHora(normHora(c.hora))}`,
            duration: 4000,
          });
          return;
        }
      }
    }

    try {
      cargarLoader();
      const { importetotal, saldo, ...resto } = turnoForm;
      const payload = {
        ...resto,
        horahasta: turnoForm.horahasta || turnoForm.hora,
        porcentajedescuento: Number(turnoForm.porcentajedescuento) || 0,
        importerecibido: Number(turnoForm.importerecibido) || 0,
        importelaboratorio: Number(turnoForm.importelaboratorio) || 0,
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
      case "ATENDIDO":
        return "turno-estado--atendido";
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

  const turnosDrawer = (diaSeleccionado ? turnosPorDia[diaSeleccionado] || [] : [])
    .filter((t) => calFiltroConsultorio === 0 || Number(t.consultorio) === calFiltroConsultorio);

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
    setTurnoForm((prev) => ({ ...prev, fecha, hora: "" }));
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
                placeholder="Buscar por paciente o doctores..."
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
              setTurnoForm((prev) => ({ ...prev, fecha: hoyKey, hora: "" }));
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
                    <th>Doctor</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Hora hasta</th>
                    <th>Consultorio</th>
                    <th>Tratamiento</th>
                    <th>Importe recibido</th>
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
                        <td>{formatoFecha(turno.fecha, "dd/MM/yyyy")}</td>
                        <td>{String(turno.hora || "").slice(0, 5)}</td>
                        <td>{String(turno.horahasta || "").slice(0, 5) || "—"}</td>
                        <td>{turno.consultorio || "-"}</td>
                        <td>{turno.descripcionTratamiento || "—"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {turno.importerecibido > 0
                            ? new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(turno.importerecibido)
                            : "—"}
                        </td>
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
                      <td className="busquedaSinresultado" colSpan={12}>
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
                  <div className="cal-legend__item">
                    <div className="cal-legend__dot cal-legend__dot--atendido" />
                    Atendido
                  </div>
                </div>
                <div className="cal-filtro-consultorio">
                  {[{ val: 0, label: "Todos" }, { val: 1, label: "Cons. 1" }, { val: 2, label: "Cons. 2" }].map(({ val, label }) => (
                    <button
                      key={val}
                      className={`cal-filtro-consultorio__btn ${calFiltroConsultorio === val ? "active" : ""}`}
                      onClick={() => setCalFiltroConsultorio(val)}
                    >
                      {label}
                    </button>
                  ))}
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
                const lista = (turnosPorDia[key] || []).filter(
                  (t) => calFiltroConsultorio === 0 || Number(t.consultorio) === calFiltroConsultorio,
                );
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
                          <span className="cal-chip__hora">{String(t.hora || "").slice(0, 5)}</span>
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
                      <span className="cal-card__hora">{String(t.hora || "").slice(0, 5)}</span>
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
                        <span className="cal-card__lbl">Doctor</span>
                        {t.doctor}
                      </div>
                    </div>
                    {t.descripcionTratamiento && (
                      <div className="cal-card__row">
                        <i className="fas fa-tooth" />
                        <div>
                          <span className="cal-card__lbl">Tratamiento</span>
                          {t.descripcionTratamiento}
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
                onChange={(val) => {
                  setTurnoForm((prev) => ({ ...prev, paciente: val, tratamiento: 0, importetotal: 0 }));
                  setLabels((prev) => ({ ...prev, tratamiento: "" }));
                  setImporteDisplay("");
                  getTratamientosPorPaciente(val);
                }}
              />
              <Buscador
                label="Doctor"
                options={listDoctores}
                placeholder="Seleccionar Doctor"
                value={turnoForm.doctor}
                labelExterno={labels.doctor}
                onLabelChange={(lbl) =>
                  setLabels((prev) => ({ ...prev, doctor: lbl }))
                }
                onChange={(val) =>
                  setTurnoForm((prev) => ({ ...prev, doctor: val }))
                }
              />
              <div style={{ position: "relative" }}>
                <Buscador
                  label="Doctor 2 (opcional)"
                  options={listDoctores}
                  placeholder="Seleccionar Doctor 2"
                  value={turnoForm.doctor2 || 0}
                  labelExterno={labels.doctor2}
                  onLabelChange={(lbl) =>
                    setLabels((prev) => ({ ...prev, doctor2: lbl }))
                  }
                  onChange={(val) =>
                    setTurnoForm((prev) => ({ ...prev, doctor2: val }))
                  }
                />
                {turnoForm.doctor2 > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setTurnoForm((prev) => ({ ...prev, doctor2: 0 }));
                      setLabels((prev) => ({ ...prev, doctor2: "" }));
                    }}
                    style={{
                      position: "absolute", top: 0, right: 0,
                      background: "none", border: "none", cursor: "pointer",
                      color: "#9ca3af", fontSize: 12, fontWeight: 700,
                      padding: "2px 4px", lineHeight: 1,
                    }}
                    title="Quitar doctor 2"
                  >
                    ✕ Quitar
                  </button>
                )}
              </div>
              <div className="input-group">
                <label className="input-label">
                  Fecha
                  {modo === "UPD" && estadoOriginal === "Confirmado" && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 11,
                        color: "#e53e3e",
                        fontWeight: 600,
                      }}
                    >
                      (bloqueada — turno confirmado)
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  className="input-field"
                  name="fecha"
                  value={turnoForm.fecha}
                  min={
                    modo === "INS"
                      ? hoyKey
                      : estadoOriginal === "Confirmado"
                        ? turnoForm.fecha
                        : fechaOriginal && fechaOriginal < hoyKey
                          ? fechaOriginal
                          : hoyKey
                  }
                  disabled={modo === "UPD" && estadoOriginal === "Confirmado"}
                  onChange={handleChangeTurno}
                  noempty="true"
                  validar="Ingrese la fecha del turno"
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">
                  Hora
                  {modo === "INS" && proximaHoraDisponible && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: "#6b7280" }}>
                      (desde {proximaHoraDisponible})
                    </span>
                  )}
                </label>
                <TimePicker
                  name="hora"
                  value={turnoForm.hora}
                  onChange={handleChangeTurno}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Hora Hasta</label>
                <TimePicker
                  name="horahasta"
                  value={turnoForm.horahasta}
                  onChange={handleChangeTurno}
                  minTime={turnoForm.hora || null}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Consultorio</label>
                <input
                  type="text"
                  className="input-field"
                  name="consultorio"
                  value={turnoForm.consultorio || ""}
                  onChange={(e) => {
                    const soloNumeros = e.target.value.replace(/\D/g, "");
                    setTurnoForm((prev) => ({
                      ...prev,
                      consultorio: soloNumeros ? Number(soloNumeros) : 0,
                    }));
                  }}
                  placeholder="Nº consultorio"
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
                  <option value="Atendido">Atendido</option>
                </select>
              </div>
              <div style={{ position: "relative" }}>
                <Buscador
                  label="Tratamiento"
                  options={listTratamientos.map((t) => ({
                    id: t.id,
                    nombre: t.descripcion || "",
                    apellido: "",
                    label: t.descripcion || "",
                  }))}
                  placeholder={turnoForm.paciente ? "Seleccionar tratamiento" : "Primero seleccione un paciente"}
                  value={turnoForm.tratamiento}
                  labelExterno={labels.tratamiento}
                  onLabelChange={(lbl) =>
                    setLabels((prev) => ({ ...prev, tratamiento: lbl }))
                  }
                  onChange={(val) => {
                    const trat = listTratamientos.find((t) => t.id === val);
                    setTurnoForm((prev) => ({
                      ...prev,
                      tratamiento: val,
                      importetotal: trat ? trat.importetotal : prev.importetotal,
                      importerecibido: 0,
                    }));
                    if (trat) {
                      setImporteDisplay(formatNumerico(trat.importetotal));
                      setSaldoDisponible(trat.saldo);
                      setImporteRecibidoDisplay("");
                    }
                  }}
                />
                {turnoForm.tratamiento > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setTurnoForm((prev) => ({ ...prev, tratamiento: 0, importetotal: 0, importerecibido: 0 }));
                      setLabels((prev) => ({ ...prev, tratamiento: "" }));
                      setImporteDisplay("");
                      setImporteRecibidoDisplay("");
                      setSaldoDisponible(null);
                    }}
                    style={{
                      position: "absolute", top: 0, right: 0,
                      background: "none", border: "none", cursor: "pointer",
                      color: "#9ca3af", fontSize: 12, fontWeight: 700,
                      padding: "2px 4px", lineHeight: 1,
                    }}
                    title="Quitar tratamiento"
                  >
                    ✕ Quitar
                  </button>
                )}
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
              <div className="input-group">
                <label className="input-label">Porcentaje a descontar</label>
                <input
                  type="number"
                  className="input-field"
                  value={turnoForm.porcentajedescuento || ""}
                  onChange={(e) => {
                    const pct = Number(e.target.value) || 0;
                    setTurnoForm((prev) => ({
                      ...prev,
                      porcentajedescuento: pct,
                      descuentodoctor: Math.round((prev.importerecibido || 0) * pct / 100),
                    }));
                  }}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Importe Total</label>
                <input
                  type="text"
                  className="input-field"
                  value={importeDisplay}
                  disabled
                  placeholder="0"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Importe Recibido</label>
                <input
                  type="text"
                  className="input-field"
                  value={importeRecibidoDisplay}
                  onChange={(e) => {
                    const raw = desformatear(e.target.value);
                    if (saldoDisponible !== null && raw > saldoDisponible) {
                      addToast({
                        type: "warning",
                        title: "Importe inválido",
                        message: `El saldo pendiente es ${Number(saldoDisponible).toLocaleString("es-PY")} Gs.`,
                        duration: 3000,
                      });
                      return;
                    }
                    setImporteRecibidoDisplay(formatNumerico(raw));
                    setTurnoForm((prev) => ({
                      ...prev,
                      importerecibido: raw,
                      descuentodoctor: Math.round(raw * (prev.porcentajedescuento || 0) / 100),
                    }));
                  }}
                  placeholder="0"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Importe Laboratorio</label>
                <input
                  type="text"
                  className="input-field"
                  value={importeLaboratorioDisplay}
                  onChange={(e) => {
                    const raw = desformatear(e.target.value);
                    setImporteLaboratorioDisplay(formatNumerico(raw));
                    setTurnoForm((prev) => ({ ...prev, importelaboratorio: raw }));
                  }}
                  placeholder="0"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Saldo</label>
                <input
                  type="text"
                  className="input-field"
                  value={formatNumerico(
                    saldoDisponible !== null
                      ? saldoDisponible - (Number(turnoForm.importerecibido) || 0)
                      : 0
                  )}
                  disabled
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
