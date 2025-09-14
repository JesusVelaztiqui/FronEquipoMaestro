import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className={`main-content shifted`}>{children}</div>
    </div>
  );
};

export default Layout;
