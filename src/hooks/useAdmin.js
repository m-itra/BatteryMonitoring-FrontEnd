import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAdminUser, getAdminStats, getAdminUsers } from "../api/admin";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    retry: false,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
    retry: false,
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
