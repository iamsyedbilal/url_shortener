import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth.api";
import { currentUserQueryKey } from "@/lib/auth/query-keys";
import type { User } from "@/types/auth";

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async (): Promise<User | null> => {
      try {
        await authApi.refreshToken();
        return await authApi.getCurrentUser();
      } catch (error) {
        // A missing or expired refresh cookie means the user is logged out.
        if (error instanceof ApiError && error.statusCode === 401) {
          return null;
        }

        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      queryClient.setQueryData(currentUserQueryKey, response.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: currentUserQueryKey });
    },
  });
}
