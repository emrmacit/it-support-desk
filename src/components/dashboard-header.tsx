"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";
import { LogOut, User as UserIcon, Terminal } from "lucide-react";
import Link from "next/link";

import { NotificationCenter } from "./notification-center";

interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  initialNotifications: any[];
}

export function DashboardHeader({ user, initialNotifications }: DashboardHeaderProps) {
  const getRoleLabel = (role: string) => {
    return role === "IT_STAFF" ? "IT STAFF" : "EMPLOYEE";
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <Link href="/dashboard" className="font-bold tracking-tight text-zinc-950 dark:text-zinc-50 hover:opacity-80 transition-opacity">
              IT Support Desk
            </Link>
            <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
              Internal Portal
            </p>
          </div>
        </div>

        {/* User profile, theme toggle and logout */}
        <div className="flex items-center space-x-4">
          {/* User profile block */}
          <div className="hidden sm:flex flex-col items-end text-right border-r border-zinc-200 dark:border-zinc-800 pr-4">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 flex items-center">
              <UserIcon className="w-3.5 h-3.5 mr-1 text-zinc-400" />
              {user.name}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mt-0.5">
              {getRoleLabel(user.role)}
            </span>
          </div>

          {/* Notification Center */}
          <NotificationCenter initialNotifications={initialNotifications} />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

