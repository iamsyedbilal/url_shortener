import type {
  AdminListParams,
  AdminUrlsResponse,
  AdminUsersResponse,
} from "@/types/admin";
import { api } from "./client";

function toQueryString(params: AdminListParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const adminApi = {
  getUsers: (params?: AdminListParams) =>
    api.get<AdminUsersResponse>(`/api/admin/users${toQueryString(params)}`),

  getUrls: (params?: AdminListParams) =>
    api.get<AdminUrlsResponse>(`/api/admin/urls${toQueryString(params)}`),

  disableUrl: (id: string) => api.patch(`/api/admin/urls/${id}/disable`),

  deleteUrl: (id: string) => api.delete<void>(`/api/admin/urls/${id}`),
};
