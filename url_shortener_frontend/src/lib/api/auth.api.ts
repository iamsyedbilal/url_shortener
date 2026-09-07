import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  RefreshTokenResponse,
  User,
} from "@/types/auth";
import { api } from "./client";
import { tokenStore } from "./token-store";

export const authApi = {
  // Create an account. Registration does not create a login session.
  register: (payload: RegisterPayload) =>
    api.post<RegisterResponse>("/api/auth/register", payload),

  // Log in and keep the returned access token in memory.
  login: async (payload: LoginPayload) => {
    const data = await api.post<AuthResponse>("/api/auth/login", payload);
    tokenStore.set(data.accessToken);
    return data;
  },

  // Revoke the refresh-token session and clear the in-memory access token.
  logout: async () => {
    const data = await api.post<null>("/api/auth/logout");
    tokenStore.set(null);
    return data;
  },

  // Get a new access token from the refresh-token cookie.
  refreshToken: async () => {
    const data = await api.post<RefreshTokenResponse>(
      "/api/auth/refresh-token",
    );
    tokenStore.set(data.accessToken);
    return data;
  },

  // Fetch the profile after the access token has been restored.
  getCurrentUser: () => api.get<User>("/api/user/me"),
};
