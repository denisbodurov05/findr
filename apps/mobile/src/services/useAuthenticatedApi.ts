import { useMemo } from "react";

import { useAuth } from "@/providers/AuthProvider";
import { createAuthenticatedApiClient } from "@/services/http";

export function useAuthenticatedApi() {
  const { getAccessToken, signOut } = useAuth();

  return useMemo(
    () => createAuthenticatedApiClient(getAccessToken, signOut),
    [getAccessToken, signOut]
  );
}
