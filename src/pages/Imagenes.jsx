import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";
import { addToast } from "../components/Tooltip";
import { sendData } from "../services/api";
import { listarImagenes } from "../services/urls";

const Imagenes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listImagenes, setListImagenes] = useState([]);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [search, setSearch] = useState("");

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
        setListImagenes(response?.data);
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

  useEffect(() => {
    getImagenes();
  }, []);

  const filtered = listImagenes.filter(
    (img) =>
      (img.titulo || "").toLowerCase().includes(search.toLowerCase()) ||
      (img.descripcion || "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleKey = useCallback(
    (e) => {
      if (!lightbox.open) return;
      if (e.key === "Escape") setLightbox({ open: false, index: 0 });
      if (e.key === "ArrowRight")
        setLightbox((prev) => ({
          ...prev,
          index: Math.min(prev.index + 1, filtered.length - 1),
        }));
      if (e.key === "ArrowLeft")
        setLightbox((prev) => ({
          ...prev,
          index: Math.max(prev.index - 1, 0),
        }));
    },
    [lightbox.open, filtered.length],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);
  const formatDate = (dateStr) => {
    if (!dateStr) return "Sin fecha";

    const [year, month, day] = dateStr.split("-");
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const currentImg = filtered[lightbox.index];

  return (
    <>
      <div className="gallery-page">
        <div className="gallery-header">
          <div className="gallery-header__info">
            <h1 className="gallery-header__title">
              <i className="fas fa-images" /> Imágenes
            </h1>
            <p className="gallery-header__sub">Imágenes del paciente</p>
          </div>

          <div className="gallery-header__actions">
            <div className="gallery-search">
              <i className="fas fa-search gallery-search__icon" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="gallery-search__input"
              />
            </div>
          </div>
        </div>
        <div className="gallery-stats">
          <span>
            <i className="fas fa-photo-film" /> {filtered.length}{" "}
            {filtered.length === 1 ? "imagen" : "imágenes"}
          </span>
          {search && <span className="gallery-stats__filter">"{search}"</span>}
        </div>
        {filtered.length === 0 && (
          <div className="gallery-empty">
            <i className="fas fa-image gallery-empty__icon" />
            <p className="gallery-empty__title">Sin imágenes</p>
            <p className="gallery-empty__sub">
              {search
                ? "No hay resultados para tu búsqueda"
                : "Subí la primera imagen del paciente"}
            </p>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="gallery-grid">
            {filtered.map((img, index) => (
              <div
                key={img.id}
                className="gallery-card"
                onClick={() => setLightbox({ open: true, index })}
              >
                <div className="gallery-card__thumb">
                  <img
                    src={img.url}
                    alt={img.titulo || `Imagen ${img.id}`}
                    loading="lazy"
                  />
                  <div className="gallery-card__overlay">
                    <i className="fas fa-expand" />
                  </div>
                </div>
                <div className="gallery-card__info">
                  <p className="gallery-card__title">
                    {"Dr. " + img.titulo || "Sin título"}
                  </p>
                  <p className="gallery-card__desc">
                    {img.observacion || "Sin descripción"}
                  </p>
                  <span className="gallery-card__date">
                    <i className="fas fa-calendar-days" />{" "}
                    {formatDate(img.fecha)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {lightbox.open && currentImg && (
        <div
          className="lightbox"
          onClick={() => setLightbox({ open: false, index: 0 })}
        >
          <div
            className="lightbox__content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox__close"
              onClick={() => setLightbox({ open: false, index: 0 })}
            >
              <i className="fas fa-xmark" />
            </button>
            <button
              className="lightbox__nav lightbox__nav--prev"
              onClick={() =>
                setLightbox((prev) => ({
                  ...prev,
                  index: Math.max(prev.index - 1, 0),
                }))
              }
              disabled={lightbox.index === 0}
            >
              <i className="fas fa-chevron-left" />
            </button>
            <div className="lightbox__img-wrap">
              <img src={currentImg.url} alt={currentImg.titulo || "Imagen"} />
            </div>
            <button
              className="lightbox__nav lightbox__nav--next"
              onClick={() =>
                setLightbox((prev) => ({
                  ...prev,
                  index: Math.min(prev.index + 1, filtered.length - 1),
                }))
              }
              disabled={lightbox.index === filtered.length - 1}
            >
              <i className="fas fa-chevron-right" />
            </button>
            <div className="lightbox__meta">
              <h3 className="lightbox__title">
                {currentImg.titulo || "Sin título"}
              </h3>
              <p className="lightbox__desc">
                {currentImg.observacion || "Sin descripción"}
              </p>
              <span className="lightbox__date">
                <i className="fas fa-calendar-days" />{" "}
                {formatDate(currentImg.fecha)}
              </span>
              <span className="lightbox__counter">
                {lightbox.index + 1} / {filtered.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Imagenes;
