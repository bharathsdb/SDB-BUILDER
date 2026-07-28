import { create } from "zustand";
import type { Notification } from "@/lib/api/mock-db";
import { mockNotifications } from "@/lib/api/mock-db";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  notifications: Notification[];
  unreadCount: number;
  activeModal: string | null;
  toasts: { id: string; message: string; type: "success" | "error" | "info" }[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  openModal: (name: string) => void;
  closeModal: () => void;
  addToast: (message: string, type: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: "system",
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.read).length,
  activeModal: null,
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  markNotificationRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
    }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
  addToast: (message, type) => {
    const id = `t${Date.now()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
