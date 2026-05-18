import { api } from "./api";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};
