import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types/auth";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user: AuthUser) => {
        localStorage.setItem("token", user.token);
        set({ user, isAuthenticated: true });
      },

      clearUser: () => {
        localStorage.removeItem("token");
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      // Only persist user identity, not the full state shape
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
