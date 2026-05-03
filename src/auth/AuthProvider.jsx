import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./AuthContext";
import { deleteMe, getMe, login, logout, register } from "../api/auth";
import { normalizeUser } from "../utils/data";

function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
    staleTime: 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const user = normalizeUser(data);
      if (user) {
        queryClient.setQueryData(["me"], user);
      } else {
        queryClient.invalidateQueries({ queryKey: ["me"] });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.setQueryData(["me"], null);
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "me" });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteMe,
    onSettled: () => {
      queryClient.setQueryData(["me"], null);
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "me" });
    },
  });

  const user = normalizeUser(meQuery.data);
  const isLoggedOut = meQuery.error?.response?.status === 401 || meQuery.data === null;

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: meQuery.isPending,
      isLoggedOut,
      meQuery,
      login: loginMutation.mutateAsync,
      register: registerMutation.mutateAsync,
      logout: logoutMutation.mutateAsync,
      deleteAccount: deleteAccountMutation.mutateAsync,
      loginStatus: loginMutation,
      registerStatus: registerMutation,
      logoutStatus: logoutMutation,
      deleteAccountStatus: deleteAccountMutation,
    }),
    [
      user,
      isLoggedOut,
      meQuery,
      loginMutation,
      registerMutation,
      logoutMutation,
      deleteAccountMutation,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
