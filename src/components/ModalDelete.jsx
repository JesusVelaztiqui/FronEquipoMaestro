const ModalDelete = ({ visible, setVisible, titulo, eliminar, funcion }) => {
  return visible ? (
    <div className="modal-overlayDelete">
      <div className="modalDelete">
        <button
          className="modal__close"
          aria-label="Cerrar modal"
          onClick={() => setVisible(false)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="modal__content">
          <h2 className="modal__title">ATENCIÓN!!!!</h2>

          <p className="modal__description">
            Atención, al eliminar
            <strong> " Está acción ya no se podrá revertir "</strong>
            <br />
            revise nuevamente antes de eliminar.
          </p>

          <div className="modal__warning">
            <div className="modal__warning-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 5v2h2v-2h-2z" />
              </svg>
            </div>
            <div className="modal__warning-content">
              <h3 className="modal__warning-title">{titulo}</h3>
              <p className="modal__warning-text">
                Desea eliminar <strong>{eliminar}</strong> <br />
                verifique antes de eliminar
              </p>
            </div>
          </div>

          <div className="modal__actions">
            <button
              className="modal__btn modal__btn--cancel"
              onClick={() => setVisible(false)}
            >
              Cancelar
            </button>
            <button
              className="modal__btn modal__btn--delete"
              onClick={() => funcion()}
            >
              <span>Eliminar</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    ""
  );
};

export default ModalDelete;
