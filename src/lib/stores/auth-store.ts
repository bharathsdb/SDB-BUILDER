import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, setTokens, clearTokens } from "../api-client";

function setAuthCookie(value: string) {
  if (typeof document !== "undefined") {
    document.cookie = `plancraft_auth=${value}; path=/; max-age=${value === "true" ? 604800 : 0}; SameSite=Lax`;
  }
}

export interface User {
  id: string; name: string; email: string;
  role: "user" | "admin" | "architect" | "builder" | "designer";
  plan: "free" | "pro" | "enterprise"; createdAt: string; verified: boolean;
  company?: string; country?: string; phone?: string; bio?: string;
  aiCreditsUsed: number; aiCreditsTotal: number; storageUsedMb: number;
  storageQuotaMb: number; projectsCount: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _lastChecked: number;        // epoch ms — used to debounce checkAuth
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: (token: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _lastChecked: 0,
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        console.log(`[AuthFlow] 1. Initiating login for email: ${email}`);
        try {
          console.log(`[AuthFlow] 2. Sending POST request to /api/auth/login`);
          const res = await apiClient("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          
          console.log(`[AuthFlow] 3. Received response with status: ${res.status}`);
          const data = await res.json();
          
          if (!res.ok) {
            console.error(`[AuthFlow] 4. Error response from server:`, data);
            set({ isLoading: false });
            // detail can be a string or a structured object {message, error_code}
            const detail = data.detail;
            const message = typeof detail === "object" && detail?.message
              ? detail.message
              : typeof detail === "string"
              ? detail
              : "Invalid email or password";
            throw new Error(message);
          }
          
          console.log(`[AuthFlow] 4. Login successful, parsing tokens`);
          setTokens(data.access_token, data.refresh_token);
          setAuthCookie("true");
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          console.log(`[AuthFlow] 5. User state updated in store`);
          return true;
        } catch (error) {
          console.error(`[AuthFlow] X. Exception caught during login request:`, error);
          set({ isLoading: false });
          // Re-throw so the frontend can catch it and display the correct message (e.g., Network Error)
          throw error;
        }
      },
      googleLogin: async (token: string) => {
        set({ isLoading: true });
        console.log(`[AuthFlow] 1. Initiating Google login`);
        try {
          const res = await apiClient("/api/auth/google-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          
          const data = await res.json();
          
          if (!res.ok) {
            set({ isLoading: false });
            const detail = data.detail;
            const message = typeof detail === "object" && detail?.message
              ? detail.message
              : typeof detail === "string"
              ? detail
              : "Google Login failed";
            throw new Error(message);
          }
          
          setTokens(data.access_token, data.refresh_token);
          setAuthCookie("true");
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          console.error(`[AuthFlow] X. Exception caught during Google login:`, error);
          set({ isLoading: false });
          throw error;
        }
      },
      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await apiClient("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ isLoading: false });
            return false;
          }
          setTokens(data.access_token, data.refresh_token);
          setAuthCookie("true");
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },
      logout: async () => {
        try {
          await apiClient("/api/auth/logout", { method: "POST" });
        } catch {}
        clearTokens();
        setAuthCookie("false");
        if (typeof window !== "undefined") {
          localStorage.clear();
        }
        set({ user: null, isAuthenticated: false });
      },
      updateProfile: async (data) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...data } });
      },
      resetPassword: async (email: string) => {
        try {
          const res = await apiClient("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword: "Temp123" }),
          });
          return res.ok;
        } catch {
          return false;
        }
      },
      checkAuth: async () => {
        const { isAuthenticated, _lastChecked } = get();
        if (isAuthenticated) return;
        // Don't hit the server more than once every 5 minutes
        const FIVE_MINUTES = 5 * 60 * 1000;
        if (Date.now() - _lastChecked < FIVE_MINUTES) return;
        set({ _lastChecked: Date.now() });
        try {
          const res = await apiClient("/api/auth/me");
          const data = await res.json();
          if (res.ok && data.user) {
            set({ user: data.user, isAuthenticated: true });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    { name: "auth-storage" }
  )
);
