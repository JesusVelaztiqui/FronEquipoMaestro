import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "../layouts/Layout";
import LoginPage from "../features/pages/LoginPage";
import Dahsboard from "../pages/Dahsboard";

const AppRoutes = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
      </Routes>
      <Routes>
        <Route
          path="/inicio"
          element={
            <Layout>
              <Dahsboard />
            </Layout>
          }
        ></Route>
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;
