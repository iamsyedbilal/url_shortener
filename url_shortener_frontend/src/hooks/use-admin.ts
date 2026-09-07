import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin.api";
import { adminUrlsQueryKey, adminUsersQueryKey } from "@/lib/admin/query-keys";
import type { AdminListParams } from "@/types/admin";

export function useAdminUsers(params: AdminListParams) {
  return useQuery({
    queryKey: [...adminUsersQueryKey, params],
    queryFn: () => adminApi.getUsers(params),
  });
}

export function useAdminUrls(params: AdminListParams) {
  return useQuery({
    queryKey: [...adminUrlsQueryKey, params],
    queryFn: () => adminApi.getUrls(params),
  });
}

export function useDisableAdminUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.disableUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUrlsQueryKey });
    },
  });
}

export function useDeleteAdminUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUrlsQueryKey });
    },
  });
}
