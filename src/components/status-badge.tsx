import React from "react";

type StatusType = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  let label = status;
  let colorClasses = "text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800";

  switch (status.toUpperCase()) {
    case "OPEN":
      label = "Open";
      colorClasses = "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40";
      break;
    case "IN_PROGRESS":
      label = "In Progress";
      colorClasses = "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40";
      break;
    case "RESOLVED":
      label = "Resolved";
      colorClasses = "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40";
      break;
    case "CLOSED":
      label = "Closed";
      colorClasses = "text-zinc-500 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800/60";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border font-mono tracking-wide ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
}
