import { useState } from "react";
import Sidebar from "./Sidebar";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";

const Layout = ({ children }) => {
  useKeyboardNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="dashboard-container">
      <div
        className={`overlay ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      <div className="mobile-header">
        <div className="logo">
          <span>E</span>quipo Maestro
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <i
            className={menuOpen ? "fas fa-xmark fa-lg" : "fas fa-bars fa-lg"}
          ></i>
        </button>
      </div>
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
