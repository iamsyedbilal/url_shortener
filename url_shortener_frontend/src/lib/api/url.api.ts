import type { CreateUrlPayload, ShortUrl } from "@/types/url";
import { api } from "./client";

export const urlApi = {
  createUrl: (payload: CreateUrlPayload) =>
    api.post<ShortUrl>("/api/url/create-url", payload),

  getMyUrls: () => api.get<ShortUrl[]>("/api/url/me"),

  disableUrl: (id: string) => api.patch<ShortUrl>(`/api/url/${id}/disable`),

  deleteUrl: (id: string) => api.delete<void>(`/api/url/${id}`),
};
