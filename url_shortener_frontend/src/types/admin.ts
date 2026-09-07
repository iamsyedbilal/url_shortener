import type { User } from "./auth";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUrl {
  _id: string;
  originalUrl: string;
  shortCode: string;
  userId: string;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  users: User[];
  pagination: Pagination;
}

export interface AdminUrlsResponse {
  urls: AdminUrl[];
  pagination: Pagination;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "user" | "admin";
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
