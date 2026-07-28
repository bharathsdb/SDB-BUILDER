import { create } from "zustand";
import { mockNotifications, type Notification } from "@/lib/api/mock-db";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notif: Omit<Notification, "id" | "createdAt">) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.read).length,

  markAsRead: (id) => {
    set(state => {
      const updated = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
      return { notifications: updated, unreadCount: updated.filter(n => !n.read).length };
    });
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: (id) => {
    set(state => {
      const updated = state.notifications.filter(n => n.id !== id);
      return { notifications: updated, unreadCount: updated.filter(n => !n.read).length };
    });
  },

  addNotification: (notif) => {
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...notif,
    };
    set(state => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + (notif.read ? 0 : 1),
    }));
  },
}));
