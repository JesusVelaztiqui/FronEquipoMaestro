import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "../layouts/Layout";
import LoginPage from "../features/pages/LoginPage";
import Dahsboard from "../pages/Dahsboard";
import Pacientes from "../pages/Pacientes";
import PrivateRoute from "./PrivateRoute";
import Inputs from "../pages/Inputs";
import Turnos from "../pages/Turnos";
import Doctores from "../pages/Doctores";
import Auditoria from "../pages/Auditoria";
import Productos from "../pages/Productos";
import Imagenes from "../pages/Imagenes";

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
          path="/doctores"
          element={
            <PrivateRoute>
              <Layout>
                <Doctores />
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
          path="/turnos"
          element={
            <PrivateRoute>
              <Layout>
                <Turnos />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <PrivateRoute>
              <Layout>
                <Productos />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/auditoria"
          element={
            <PrivateRoute>
              <Layout>
                <Auditoria />
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
        <Route
          path="/imagenes/:id"
          element={
            <PrivateRoute>
              <Layout>
                <Imagenes />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;
