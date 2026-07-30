"use client";

import React, { useTransition, useOptimistic } from "react";
import { updateTicketStatusAction } from "@/app/actions";

interface TicketStatusSelectProps {
  ticketId: string;
  initialStatus: string;
}

export function TicketStatusSelect({ ticketId, initialStatus }: TicketStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(initialStatus);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    startTransition(async () => {
      // Set the optimistic status immediately
      setOptimisticStatus(value);
      const res = await updateTicketStatusAction(ticketId, value);
      if (!res.success) {
        alert(res.error || "An error occurred while updating the status.");
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Update Status:</span>
      <select
        value={optimisticStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 font-mono tracking-wide focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 dark:focus:ring-zinc-600 dark:focus:border-zinc-600 cursor-pointer disabled:opacity-50 transition-opacity"
      >
        <option value="OPEN">OPEN</option>
        <option value="IN_PROGRESS">IN PROGRESS</option>
        <option value="RESOLVED">RESOLVED</option>
        <option value="CLOSED">CLOSED</option>
      </select>
    </div>
  );
}
