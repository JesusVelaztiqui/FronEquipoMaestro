import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "../layouts/Layout";
import LoginPage from "../features/pages/LoginPage";
import Dahsboard from "../pages/Dahsboard";
import Pacientes from "../pages/Pacientes";
import PrivateRoute from "./PrivateRoute";
import Inputs from "../pages/Inputs";

const AppRoutes = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/inicio"
          element={
            <PrivateRoute>
              <Layout>
                <Dahsboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/pacientes"
          element={
            <PrivateRoute>
              <Layout>
                <Pacientes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/inputs"
          element={
            <PrivateRoute>
              <Layout>
                <Inputs />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;
