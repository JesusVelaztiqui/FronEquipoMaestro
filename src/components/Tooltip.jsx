import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

let addToastInternal = null;

export const addToast = ({ type, title, message, duration = 3000 }) => {
  if (addToastInternal) {
    addToastInternal({ type, title, message, duration });
  }
};

const getToastIcon = (type) => {
  switch (type) {
    case "success":
      return <i className="fas fa-check"></i>;
    case "error":
      return <i className="fas fa-exclamation"></i>;
    case "warning":
      return <i className="fas fa-exclamation-triangle"></i>;
    case "info":
      return <i className="fas fa-exclamation"></i>;
    default:
      return <i className="fas fa-info"></i>;
  }
};

export default function ToastManager() {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    addToastInternal = (toast) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [{ ...toast, id, visible: true }, ...prev]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
        );
      }, toast.duration);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration + 400);
    };

    return () => {
      addToastInternal = null;
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          style={{
            opacity: toast.visible ? 1 : 0,
            transition: "all 0.4s ease",
          }}
        >
          <div className="toast-content">
            <div className="toast-icon">{getToastIcon(toast.type)}</div>
            <div className="toast-text">
              <div className="toast-header">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
            ></button>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}
