import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuth = localStorage.getItem("token");

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
