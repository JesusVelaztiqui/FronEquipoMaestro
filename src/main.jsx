import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AppRoutes from "./routes/Routes.jsx";
import ToastManager from "./components/Tooltip.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRoutes></AppRoutes>
    <ToastManager />
  </StrictMode>
);
