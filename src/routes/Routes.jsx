import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Layout from "../layouts/Layout";
import LoginPage from "../features/pages/LoginPage";

const AppRoutes = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
      </Routes>
      <Routes>
        <Route
          path="/home"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        ></Route>
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;
