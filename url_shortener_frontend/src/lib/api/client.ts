import { tokenStore } from "./token-store";

// Every API request starts with this URL.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// This is the response shape returned by the backend.
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

// Failed API requests are converted into this error type for the UI to display.
export class ApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

// These options are shared by all GET, POST, PATCH, and DELETE helpers.
interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  accessToken?: string | null;
}

// Read the backend response and return only its data property.
async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    if (!response.ok) {
      throw new ApiError(
        response.statusText || "Request failed",
        response.status,
      );
    }

    return undefined as T;
  }

  const payload = (await response.json()) as ApiResponse<T> & {
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(
      payload.message || "Request failed",
      response.status,
      payload.data,
    );
  }

  return payload.data;
}

// Only one refresh request is allowed when several requests expire together.
let refreshPromise: Promise<string | null> | null = null;

// Ask the backend for a new access token using the HTTP-only refresh cookie.
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          tokenStore.set(null);
          return null;
        }
        const payload = (await response.json()) as ApiResponse<{
          accessToken: string;
        }>;
        tokenStore.set(payload.data.accessToken);
        return payload.data.accessToken;
      } catch {
        tokenStore.set(null);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

// Send one request, retrying it once after a successful token refresh.
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const { body, accessToken, headers, ...requestOptions } = options;

  const requestHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const token = accessToken ?? tokenStore.get();
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    credentials: "include",
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  if (
    response.status === 401 &&
    !isRetry &&
    !path.includes("/api/auth/refresh-token") &&
    !path.includes("/api/auth/login")
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiRequest<T>(path, { ...options, accessToken: newToken }, true);
    }
  }

  return parseResponse<T>(response);
}

// Short methods used by feature-specific API modules.
export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),

  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => apiRequest<T>(path, { ...options, method: "POST", body }),

  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => apiRequest<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => apiRequest<T>(path, { ...options, method: "DELETE" }),
};
