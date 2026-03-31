import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
  'input:not([disabled]):not([readonly]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])';

const SKIP_TYPES = ["submit", "button", "reset", "checkbox", "radio"];

const isVisible = (el) => {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const getFocusableInputs = () =>
  Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => !SKIP_TYPES.includes(el.type) && isVisible(el)
  );

export const useKeyboardNavigation = () => {
  // Enter → avanza al siguiente input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Enter") return;

      const el = e.target;
      const tag = el.tagName.toLowerCase();

      if (!["input", "select"].includes(tag)) return;
      if (SKIP_TYPES.includes(el.type)) return;

      e.preventDefault();

      const focusable = getFocusableInputs();
      const idx = focusable.indexOf(el);
      if (idx >= 0 && idx < focusable.length - 1) {
        focusable[idx + 1].focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ESC → cierra el modal abierto
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key !== "Escape") return;

      // Modal normal (display: flex/none) → botón .modal-close
      const modalOverlay = document.querySelector(".modal-overlay");
      if (modalOverlay && modalOverlay.style.display === "flex") {
        const closeBtn = modalOverlay.querySelector(".modal-close");
        if (closeBtn) { closeBtn.click(); return; }
      }

      // ModalDelete (renderizado condicional) → botón cancel o close
      const modalDelete = document.querySelector(".modal-overlayDelete");
      if (modalDelete) {
        const cancelBtn = modalDelete.querySelector(
          ".modal__btn--cancel, .modal__close"
        );
        if (cancelBtn) { cancelBtn.click(); return; }
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // MutationObserver → foco en el primer input cuando se abre un modal
  useEffect(() => {
    const focusFirstInput = (container) => {
      setTimeout(() => {
        const first = container.querySelector(FOCUSABLE_SELECTOR);
        if (first) first.focus();
      }, 50);
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Modal normal: cambio de style display → flex
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const target = mutation.target;
          if (
            target.classList.contains("modal-overlay") &&
            target.style.display === "flex"
          ) {
            focusFirstInput(target);
          }
          return;
        }

        // ModalDelete: nodo agregado al DOM (renderizado condicional)
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (
              node.nodeType === 1 &&
              node.classList.contains("modal-overlayDelete")
            ) {
              focusFirstInput(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);
};
