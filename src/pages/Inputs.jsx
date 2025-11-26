import { useState } from "react";

const Inputs = () => {
  const [textValue, setTextValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [selectSearchValue, setSelectSearchValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [textareaValue, setTextareaValue] = useState("");

  const options = [
    { value: "option1", label: "Opción 1" },
    { value: "option2", label: "Opción 2" },
    { value: "option3", label: "Opción 3" },
    { value: "option4", label: "Opción 4" },
  ];

  return (
    <div className="input-showcase">
      <div className="input-showcase__grid">
        {/* Input de Texto */}
        <div className="input-group">
          <label className="input-label">Input de Texto</label>
          <input
            type="text"
            className="input-field"
            placeholder="Escribe aquí..."
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          />
        </div>

        {/* Input de Búsqueda */}
        <div className="input-group">
          <label className="input-label">Buscador</label>
          <div className="input-search">
            <input
              type="text"
              className="input-field input-field--search"
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
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

        {/* Select Normal */}
        <div className="input-group">
          <label className="input-label">Select Normal</label>
          <select
            className="input-select"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Select con Búsqueda */}
        <div className="input-group">
          <label className="input-label">Select con Búsqueda</label>
          <div className="input-search">
            <select
              className="input-select input-select--search"
              value={selectSearchValue}
              onChange={(e) => setSelectSearchValue(e.target.value)}
            >
              <option value="">Buscar y seleccionar...</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Textarea */}
        <div className="input-group input-group--full">
          <label className="input-label">Textarea</label>
          <textarea
            className="input-textarea"
            placeholder="Escribe un comentario..."
            rows="4"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
          />
        </div>

        {/* Checkbox */}
        <div className="input-group">
          <label className="input-checkbox">
            <input
              type="checkbox"
              checked={checkboxValue}
              onChange={(e) => setCheckboxValue(e.target.checked)}
            />
            <span className="input-checkbox__checkmark"></span>
            <span className="input-checkbox__label">Aceptar términos</span>
          </label>
        </div>

        {/* Switch */}
        <div className="input-group">
          <label className="input-switch">
            <input
              type="checkbox"
              checked={switchValue}
              onChange={(e) => setSwitchValue(e.target.checked)}
            />
            <span className="input-switch__slider"></span>
            <span className="input-switch__label">
              {switchValue ? "Activado" : "Desactivado"}
            </span>
          </label>
        </div>

        {/* Radio Buttons */}
        <div className="input-group input-group--full">
          <label className="input-label">Radio Buttons</label>
          <div className="input-radio-group">
            <label className="input-radio">
              <input
                type="radio"
                name="radio"
                value="option1"
                checked={radioValue === "option1"}
                onChange={(e) => setRadioValue(e.target.value)}
              />
              <span className="input-radio__checkmark"></span>
              <span className="input-radio__label">Opción 1</span>
            </label>

            <label className="input-radio">
              <input
                type="radio"
                name="radio"
                value="option2"
                checked={radioValue === "option2"}
                onChange={(e) => setRadioValue(e.target.value)}
              />
              <span className="input-radio__checkmark"></span>
              <span className="input-radio__label">Opción 2</span>
            </label>

            <label className="input-radio">
              <input
                type="radio"
                name="radio"
                value="option3"
                checked={radioValue === "option3"}
                onChange={(e) => setRadioValue(e.target.value)}
              />
              <span className="input-radio__checkmark"></span>
              <span className="input-radio__label">Opción 3</span>
            </label>
          </div>
        </div>

        {/* Input Deshabilitado */}
        <div className="input-group">
          <label className="input-label">Input Deshabilitado</label>
          <input
            type="text"
            className="input-field"
            placeholder="No editable"
            disabled
          />
        </div>

        {/* Input con Error */}
        <div className="input-group">
          <label className="input-label">Input con Error</label>
          <input
            type="email"
            className="input-field input-field--error"
            placeholder="correo@ejemplo.com"
            value="correo-invalido"
          />
          <span className="input-error">Email inválido</span>
        </div>

        {/* Input con Éxito */}
        <div className="input-group">
          <label className="input-label">Input con Éxito</label>
          <input
            type="email"
            className="input-field input-field--success"
            placeholder="correo@ejemplo.com"
            value="correo@valido.com"
          />
          <span className="input-success">Email válido</span>
        </div>
      </div>
    </div>
  );
};

export default Inputs;
