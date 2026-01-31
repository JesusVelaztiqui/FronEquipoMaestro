import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,
  setUser: (userData) => {
    set({ user: userData });
    localStorage.setItem("usuarioMaestro", JSON.stringify(userData));
  },
  clearUser: () => {
    set({ user: null });
    localStorage.removeItem("usuarioMaestro");
  },
  loadUser: () => {
    const data = localStorage.getItem("usuarioMaestro");
    if (data) set({ user: JSON.parse(data) });
  },
}));

export default useUserStore;
