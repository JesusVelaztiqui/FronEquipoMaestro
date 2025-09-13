import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

let addToastInternal = null;

export const addToast = ({ type, title, message, duration = 3000 }) => {
  if (addToastInternal) {
    addToastInternal({ type, title, message, duration });
  }
};

export default function ToastManager() {
  const [toasts, setToasts] = useState([]);

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
    <div
      className="toast-container"
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 9999,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          style={{
            opacity: toast.visible ? 1 : 0,
            transition: "opacity 0.4s",
          }}
        >
          <div className="toast-header">{toast.title}</div>
          <div className="toast-message">{toast.message}</div>
        </div>
      ))}
    </div>,
    document.body
  );
}
