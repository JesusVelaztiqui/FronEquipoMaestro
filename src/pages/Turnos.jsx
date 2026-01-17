import { useState, useRef, useEffect } from "react";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const filesWithProgress = newFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      uploading: true,
    }));

    setFiles((prev) => [...prev, ...filesWithProgress]);

    filesWithProgress.forEach((fileObj) => {
      simulateUpload(fileObj.id);
    });
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
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "fa-file-pdf";
    if (["doc", "docx"].includes(ext)) return "fa-file-word";
    if (["xls", "xlsx"].includes(ext)) return "fa-file-excel";
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "fa-file-image";
    if (["zip", "rar", "7z"].includes(ext)) return "fa-file-archive";
    return "fa-file";
  };

  return (
    <div className="file-upload">
      <div
        className={`file-upload__dropzone ${
          isDragging ? "file-upload__dropzone--dragging" : ""
        }`}
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

      {files.length > 0 && (
        <div className="file-upload__list">
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
                      ? `${fileObj.progress}% of ${formatFileSize(
                          fileObj.file.size,
                        )}`
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
                onClick={() => removeFile(fileObj.id)}
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

const Turnos = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const mockTurnos = [
    {
      id: 1,
      paciente: "Juan Pérez",
      medico: "Dra. Ana Solis",
      fecha: "15/12/2024",
      hora: "09:00",
      estado: "Confirmado",
      tratamiento: "Limpieza dental",
    },
    {
      id: 2,
      paciente: "María González",
      medico: "Dra. Carolina Sosa",
      fecha: "15/12/2024",
      hora: "10:30",
      estado: "Pendiente",
      tratamiento: "Extracción",
    },
    {
      id: 3,
      paciente: "Carlos Benítez",
      medico: "Dra. Patricia Ojeda",
      fecha: "16/12/2024",
      hora: "14:00",
      estado: "Confirmado",
      tratamiento: "Ortodoncia",
    },
    {
      id: 4,
      paciente: "Laura Martínez",
      medico: "Dra. Ana Solis",
      fecha: "16/12/2024",
      hora: "15:30",
      estado: "Cancelado",
      tratamiento: "Endodoncia",
    },
    {
      id: 5,
      paciente: "Roberto Silva",
      medico: "Dra. Carolina Sosa",
      fecha: "17/12/2024",
      hora: "11:00",
      estado: "Confirmado",
      tratamiento: "Implante",
    },
    {
      id: 6,
      paciente: "Ana López",
      medico: "Dra. Patricia Ojeda",
      fecha: "17/12/2024",
      hora: "16:00",
      estado: "Pendiente",
      tratamiento: "Control",
    },
  ];

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Confirmado":
        return "turno-estado--confirmado";
      case "Pendiente":
        return "turno-estado--pendiente";
      case "Cancelado":
        return "turno-estado--cancelado";
      default:
        return "";
    }
  };

  const TooltipActions = ({ turnoId }) => {
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    const isActive = activeTooltip === turnoId;

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

        if (left < 20) {
          left = 20;
        }

        if (left + tooltipRect.width > viewportWidth - 20) {
          left = viewportWidth - tooltipRect.width - 20;
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.transform = "none";
      }
    }, [isActive]);

    const handleToggle = (e) => {
      e.stopPropagation();
      setActiveTooltip(isActive ? null : turnoId);
    };

    const handleAction = (action) => {
      console.log(`${action} para turno ID: ${turnoId}`);
      setActiveTooltip(null);
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
    const handleClickOutside = (e) => {
      if (!e.target.closest(".tooltip-wrapper")) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Turnos</h1>
            <p className="mock-papers__subtitle">
              Gestiona los turnos y citas de tus pacientes
            </p>
          </div>

          <div className="mock-papers__search">
            <div className="input-group">
              <div className="input-search">
                <input
                  type="text"
                  className="input-field input-field--search"
                  placeholder="Buscar por paciente o médico..."
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
                {mockTurnos.map((turno, index) => (
                  <tr key={turno.id}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{turno.paciente}</td>
                    <td>{turno.medico}</td>
                    <td>{turno.fecha}</td>
                    <td>{turno.hora}</td>
                    <td>{turno.tratamiento}</td>
                    <td>
                      <span
                        className={`turno-estado ${getEstadoClass(
                          turno.estado,
                        )}`}
                      >
                        {turno.estado}
                      </span>
                    </td>
                    <td>
                      <TooltipActions turnoId={turno.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mock-papers__pagination">
            <button
              className={`mock-papers__page-btn ${
                currentPage === 1 ? "active" : ""
              }`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            <button
              className="mock-papers__page-btn"
              onClick={() => setCurrentPage(2)}
            >
              2
            </button>
            <span className="mock-papers__dots">...</span>
            <button className="mock-papers__page-btn">6</button>
            <button className="mock-papers__page-btn">7</button>
            <button className="mock-papers__page-btn">8</button>
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
            <h2 className="modal-title">Nuevo Turno</h2>
            <button className="modal-close" onClick={() => setOpenModal(false)}>
              &times;
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Paciente</label>
                <select className="input-select">
                  <option value="">Seleccionar paciente</option>
                  <option value="1">Juan Pérez</option>
                  <option value="2">María González</option>
                  <option value="3">Carlos Benítez</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Médico</label>
                <select className="input-select">
                  <option value="">Seleccionar médico</option>
                  <option value="1">Dra. Ana Solis</option>
                  <option value="2">Dra. Carolina Sosa</option>
                  <option value="3">Dra. Patricia Ojeda</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Fecha</label>
                <input type="date" className="input-field" />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Hora</label>
                <input type="time" className="input-field" />
              </div>
              <div className="input-group">
                <label className="input-label">Estado</label>
                <select className="input-select">
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
                  placeholder="Ej: Limpieza dental, Extracción, etc."
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Observaciones</label>
                <textarea
                  className="input-textarea"
                  placeholder="Notas adicionales sobre el turno, productos utilizados etc..."
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Descontar al Médico</label>
                <select className="input-select">
                  <option value="">Seleccionar médico</option>
                  <option value="1">Dra. Ana Solis</option>
                  <option value="2">Dra. Carolina Sosa</option>
                  <option value="3">Dra. Patricia Ojeda</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Porcentaje a descontar</label>
                <input type="text" className="input-field" />
              </div>
              <div className="input-group">
                <label className="input-label">Importe Total</label>
                <input type="text" className="input-field" />
              </div>
            </div>

            <div className="modal-row">
              <div className="input-group">
                <label className="input-label">Carga de Almacenamiento</label>
                <FileUpload />
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

export default Turnos;
