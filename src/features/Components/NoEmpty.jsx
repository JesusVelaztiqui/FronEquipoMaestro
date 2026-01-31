import { useState } from "react";
import { addToast } from "../../components/Tooltip";

export const NoEmpty = () => {
  const [errors, setErrors] = useState({});

  const validate = (container = document) => {
    const elements = Array.from(
      container.querySelectorAll("input[NoEmpty], select[NoEmpty]"),
    );
    const newErrors = {};
    let valid = true;

    for (let el of elements) {
      const value = el.value?.trim();
      const name = el.name || el.id || el.dataset.name;
      const msg = el.getAttribute("validar") || "Este campo es obligatorio";
      if (!value) {
        newErrors[name] = msg;
        valid = false;

        addToast({
          type: "warning",
          title: "Atención",
          message: msg,
          duration: 3000,
        });

        break;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const clearErrors = () => setErrors({});

  return { errors, validate, clearErrors };
};
