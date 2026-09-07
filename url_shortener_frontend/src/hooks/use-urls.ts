import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { urlApi } from "@/lib/api/url.api";
import { myUrlsQueryKey } from "@/lib/url/query-keys";

export function useMyUrls() {
  return useQuery({
    queryKey: myUrlsQueryKey,
    queryFn: urlApi.getMyUrls,
  });
}

export function useCreateUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: urlApi.createUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myUrlsQueryKey });
    },
  });
}

export function useDisableUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: urlApi.disableUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myUrlsQueryKey });
    },
  });
}

export function useDeleteUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: urlApi.deleteUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myUrlsQueryKey });
    },
  });
}
