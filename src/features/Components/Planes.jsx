import { useState } from "react";

const Planes = ({ isOpen, onClose, validarRegistrarmePrueba }) => {
  const [billingType, setBillingType] = useState("monthly");

  const plans = {
    starter: {
      name: "Gratis",
      icon: "💎",
      monthly: { price: 0, period: "Mes" },
      annually: { price: 0, period: "Año" },
      description:
        "Ideal para pequeños comercios o emprendedores que recién comienzan. Incluye las funciones básicas de facturación y control de ventas.",
      features: [
        "Facturación electrónica básica",
        "Control simple de ventas",
        "Registro de productos y clientes",
        "Reportes básicos de ventas",
        "Soporte limitado al cliente",
      ],
      buttonText: "Empieza Gratis",
      buttonStyle: "primary",
    },
    genius: {
      name: "Profesional",
      icon: "🧠",
      monthly: { price: "500.000", period: " 6 Meses" },
      annually: { price: "1.600.000", period: " 2 Años" },
      description:
        "Diseñado para empresas y cadenas comerciales que requieren soluciones completas de facturación, control multi-sucursal y personalización avanzada.",
      features: [
        "Todas las características del plan Inicial",
        "Facturación avanzada e ilimitada",
        "Control multi-sucursal y bodegas",
        "Panel de estadísticas en tiempo real",
        "Soporte dedicado con gerente de cuenta",
        "Integración con sistemas contables",
        "Automatización de procesos de facturación",
      ],
      buttonText: "Comenzar",
      buttonStyle: "secondary",
    },
    professional: {
      name: "Emprendedor",
      icon: "💼",
      monthly: { price: "100.000", period: " Mes" },
      annually: { price: "900.000", period: " Año" },
      description:
        "Perfecto para negocios en crecimiento que necesitan mayor control de inventario, reportes detallados y asistencia prioritaria.",
      features: [
        "Todas las características del plan Gratis",
        "Gestión avanzada de inventario",
        "Múltiples usuarios y permisos",
        "Reportes financieros y de ventas",
        "Soporte prioritario al cliente",
        "Integración con impresoras y lectores",
      ],
      buttonText: "Comenzar",
      buttonStyle: "secondary",
    },
  };

  if (!isOpen) return null;

  return (
    <div className="pricing-modal-overlay" onClick={onClose}>
      <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pricing-modal__close" onClick={onClose}>
          ×
        </button>

        <div className="pricing-modal__header">
          <h2 className="pricing-modal__title">
            Elige{" "}
            <span className="pricing-modal__title--highlight">El Plan</span>{" "}
            Adecuado Para
          </h2>
          <h3 className="pricing-modal__subtitle">
            ¡Tus Objetivos de Inversión!
          </h3>

          <div className="pricing-modal__toggle">
            <button
              className={`pricing-modal__toggle-btn ${
                billingType === "monthly" ? "active" : ""
              }`}
              onClick={() => setBillingType("monthly")}
            >
              Mensual
            </button>
            <button
              className={`pricing-modal__toggle-btn ${
                billingType === "annually" ? "active" : ""
              }`}
              onClick={() => setBillingType("annually")}
            >
              Anual
            </button>
          </div>
        </div>

        <div className="pricing-modal__plans">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className={`pricing-plan ${
                key === "genius" ? "pricing-plan--popular" : ""
              }`}
            >
              <div className="pricing-plan__header">
                <div className="pricing-plan__icon">{plan.icon}</div>
                <h4 className="pricing-plan__name">{plan.name}</h4>
                <div className="pricing-plan__price">
                  <span className="pricing-plan__currency">₲</span>
                  <span className="pricing-plan__amount">
                    {plan[billingType].price}
                  </span>
                  <span className="pricing-plan__period">
                    /{plan[billingType].period}
                  </span>
                </div>
                <p className="pricing-plan__description">{plan.description}</p>
              </div>

              <div className="pricing-plan__features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="pricing-plan__feature">
                    <span className="pricing-plan__feature-check">✓</span>
                    <span className="pricing-plan__feature-text">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className={`pricing-plan__button pricing-plan__button--${plan.buttonStyle}`}
                onClick={async () => {
                  if (plan?.buttonText === "Empieza Gratis") {
                    await validarRegistrarmePrueba();
                  }
                }}
              >
                {plan.buttonText}
                <span className="pricing-plan__button-arrow">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Planes;
