import { useEffect } from "react";
import useUserStore from "../features/auth/zustandUser";
import AdminDashboard from "./DashboardAdmin";
import DahsboardDoctores from "./DashboardDoctores";

const Dahsboard = () => {
  const { user, loadUser } = useUserStore();

  useEffect(() => {
    loadUser();
  }, []);

  const retornarDashboard = () => {
    switch (user?.role) {
      case "admin":
        return <AdminDashboard />;
      case "dr":
        return <DahsboardDoctores />;

      default:
        return "";
    }
  };

  return retornarDashboard();
};

export default Dahsboard;
