import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
} from "@/types/auth";
import { api } from "./client";
import { tokenStore } from "./token-store";

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<RegisterResponse>("/api/auth/register", payload),

  login: async (payload: LoginPayload) => {
    const data = await api.post<AuthResponse>("/api/auth/login", payload);
    tokenStore.set(data.accessToken);
    return data;
  },

  logout: async () => {
    const data = await api.post<null>("/api/auth/logout");
    tokenStore.set(null);
    return data;
  },

  refreshToken: () => api.post<AuthResponse>("/api/auth/refresh-token"),
};
