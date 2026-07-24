import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  role: string | null;
  name: string | null;
  department: string | null;
  setAuth: (token: string, role: string, name: string, department: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      name: null,
      department: null,
      setAuth: (token, role, name, department) =>
        set({ token, role, name, department }),
      logout: () =>
        set({ token: null, role: null, name: null, department: null }),
    }),
    { name: "eos-auth" }
  )
);
