"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { Bell, Check, X, AlertCircle } from "lucide-react";
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from "@/app/actions";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
};

interface NotificationCenterProps {
  initialNotifications: Notification[];
}

export function NotificationCenter({ initialNotifications }: NotificationCenterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state if initialNotifications changes (due to Server Component revalidation)
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const res = await markNotificationAsReadAction(id);
      if (!res.success) {
        // Rollback or refresh on error
        router.refresh();
      }
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      // Optimistic update
      setNotifications([]);
      const res = await markAllNotificationsAsReadAction();
      if (!res.success) {
        // Rollback or refresh on error
        router.refresh();
      }
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
        )}
      </button>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg shadow-lg z-50 overflow-hidden font-sans">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 font-mono">
              NOTIFICATIONS ({unreadCount})
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center space-x-1 hover:underline cursor-pointer"
              >
                <Check className="w-3 h-3 mr-0.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                No new notifications.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 flex items-start justify-between gap-3 group transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-normal">
                      {notification.message}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400">
                      {new Date(notification.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
