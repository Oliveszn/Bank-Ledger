import { useNavigate } from "react-router-dom";
import type { LoginPayload, RegisterPayload } from "../types/auth";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";

export const useRegister = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: async (res) => {
      setUser(res.payload);
      navigate("/dashboard");
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: async (res) => {
      setUser(res.payload);
      navigate("/dashboard");
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const { clearUser } = useAuthStore();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearUser();
      navigate("/");
    },
  });
};
