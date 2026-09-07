import type { ReactNode } from "react";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { AuthContext } from "@/lib/auth/auth-context";
import { tokenStore } from "@/lib/api/token-store";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // This query runs once when the app starts and restores the session.
  const currentUserQuery = useCurrentUser();
  const logoutMutation = useLogout();
  const user = currentUserQuery.data ?? null;
  const accessToken = tokenStore.get();

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading: currentUserQuery.isLoading,
        isAuthenticated: Boolean(user && accessToken),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
