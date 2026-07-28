"use client";

import * as React from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthInitializer() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (!isAuthenticated) {
      // Silently check if an existing token/session is valid.
      // Never attempt auto-login with fake credentials.
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  return null;
}
