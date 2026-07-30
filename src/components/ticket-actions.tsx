"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { reopenTicketAction, deleteTicketAction } from "@/app/actions";
import { RefreshCw, Trash2, Loader2 } from "lucide-react";

interface TicketActionProps {
  ticketId: string;
  redirectUrl?: string;
  className?: string;
}

export function ReopenTicketButton({ ticketId, className = "" }: TicketActionProps) {
  const [isPending, startTransition] = useTransition();

  const handleReopen = () => {
    if (confirm("Are you sure you want to reopen this support ticket?")) {
      startTransition(async () => {
        const res = await reopenTicketAction(ticketId);
        if (!res.success) {
          alert(res.error || "An error occurred while reopening the ticket.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleReopen}
      disabled={isPending}
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-medium font-mono transition-colors duration-150 disabled:opacity-50 cursor-pointer shadow-sm ${className}`}
      title="Reopen Ticket"
    >
      {isPending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          Reopening...
        </>
      ) : (
        <>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Reopen Ticket
        </>
      )}
    </button>
  );
}

export function DeleteTicketButton({ ticketId, redirectUrl, className = "" }: TicketActionProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this support ticket? This action cannot be undone.")) {
      startTransition(async () => {
        const res = await deleteTicketAction(ticketId);
        if (res.success) {
          if (redirectUrl) {
            router.push(redirectUrl);
          }
        } else {
          alert(res.error || "An error occurred while deleting the ticket.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-medium font-mono transition-colors duration-150 disabled:opacity-50 cursor-pointer shadow-sm ${className}`}
      title="Delete Ticket"
    >
      {isPending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Delete Ticket
        </>
      )}
    </button>
  );
}

