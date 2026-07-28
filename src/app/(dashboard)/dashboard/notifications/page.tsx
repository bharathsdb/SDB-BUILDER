"use client";

import * as React from "react";
import {
  Bell, Check, Info, AlertTriangle, X, CheckCheck,
  MailOpen, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const typeConfig: Record<string, { icon: typeof Check; color: string; bg: string }> = {
  success: { icon: Check, color: "text-success", bg: "bg-success/10" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  error: { icon: X, color: "text-danger", bg: "bg-danger/10" },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markNotificationRead, markAllRead } = useUIStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "No unread notifications"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No notifications</h3>
          <p className="text-slate-500 text-sm">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, i) => {
            const config = typeConfig[notification.type] || typeConfig.info;
            const Icon = config.icon;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                key={notification.id}
              >
                <Card
                  className={`transition-colors ${
                    !notification.read
                      ? "border-primary/30 bg-primary/[0.02] dark:bg-primary/[0.05]"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <CardContent className="flex items-start gap-4 py-4">
                    <div className={`p-2 rounded-xl ${config.bg} ${config.color} flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{notification.title}</p>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{notification.message}</p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationRead(notification.id)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0"
                        title="Mark as read"
                      >
                        <MailOpen className="w-4 h-4" />
                      </button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
