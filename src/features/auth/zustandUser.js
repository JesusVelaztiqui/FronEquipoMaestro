import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,
  setUser: (userData) => {
    set({ user: userData });
    localStorage.setItem("UsuarioInnova", JSON.stringify(userData));
  },
  clearUser: () => {
    set({ user: null });
    localStorage.removeItem("UsuarioInnova");
  },
  loadUser: () => {
    const data = localStorage.getItem("UsuarioInnova");
    if (data) set({ user: JSON.parse(data) });
  },
}));

export default useUserStore;
