"use client";

import React, { useTransition, useOptimistic } from "react";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { deleteTicketAction } from "@/app/actions";
import { MessageSquare, ArrowUpRight, Clock, ShieldAlert, Trash2 } from "lucide-react";

type Ticket = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: Date | string;
  user?: {
    name: string;
    email: string;
  };
  _count?: {
    comments: number;
  };
};

interface TicketTableProps {
  tickets: Ticket[];
  isItStaff?: boolean;
  onStatusChange?: (ticketId: string, status: string) => Promise<any>;
}

export function TicketTable({ tickets, isItStaff = false, onStatusChange }: TicketTableProps) {
  const [, startTransition] = useTransition();

  // Optimistic tickets updates
  const [optimisticTickets, setOptimisticTickets] = useOptimistic(
    tickets,
    (state, update: { type: "status" | "delete"; ticketId: string; newStatus?: string }) => {
      if (update.type === "delete") {
        return state.filter((t) => t.id !== update.ticketId);
      }
      return state.map((t) => (t.id === update.ticketId ? { ...t, status: update.newStatus! } : t));
    }
  );

  const getPriorityStyle = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "HIGH":
        return "text-red-600 dark:text-red-400 font-semibold";
      case "MEDIUM":
        return "text-amber-600 dark:text-amber-400";
      case "LOW":
        return "text-zinc-500 dark:text-zinc-400";
      default:
        return "";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category.toUpperCase()) {
      case "HARDWARE":
        return "Hardware";
      case "SOFTWARE":
        return "Software";
      case "NETWORK":
        return "Network / Internet";
      case "ACCESS":
        return "Access / Permissions";
      default:
        return category;
    }
  };

  const handleStatusSelect = (ticketId: string, value: string) => {
    if (onStatusChange) {
      startTransition(async () => {
        // Apply status update optimistically
        setOptimisticTickets({ type: "status", ticketId, newStatus: value });
        // Execute server action
        await onStatusChange(ticketId, value);
      });
    }
  };

  const handleDelete = (ticketId: string) => {
    if (confirm("Are you sure you want to delete this support ticket?")) {
      startTransition(async () => {
        setOptimisticTickets({ type: "delete", ticketId });
        const res = await deleteTicketAction(ticketId);
        if (!res.success) {
          alert(res.error || "An error occurred while deleting the ticket.");
        }
      });
    }
  };

  if (optimisticTickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-center bg-zinc-50/50 dark:bg-zinc-950/20">
        <Clock className="w-8 h-8 text-zinc-400 mb-3" />
        <p className="text-zinc-600 dark:text-zinc-400 font-medium">No support tickets found.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs font-mono uppercase tracking-wider">
            <th className="px-6 py-4 font-semibold">TICKET ID</th>
            <th className="px-6 py-4 font-semibold">TITLE</th>
            <th className="px-6 py-4 font-semibold">CATEGORY</th>
            <th className="px-6 py-4 font-semibold">PRIORITY</th>
            {isItStaff && <th className="px-6 py-4 font-semibold">SUBMITTER</th>}
            <th className="px-6 py-4 font-semibold">STATUS</th>
            <th className="px-6 py-4 font-semibold">DATE</th>
            <th className="px-6 py-4 font-semibold text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
          {optimisticTickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors duration-150"
            >
              {/* TICKET ID */}
              <td className="px-6 py-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                #{ticket.id.substring(0, 8)}
              </td>
              {/* TITLE */}
              <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                {ticket.title}
              </td>
              {/* CATEGORY */}
              <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                {getCategoryLabel(ticket.category)}
              </td>
              {/* PRIORITY */}
              <td className={`px-6 py-4 font-mono text-xs ${getPriorityStyle(ticket.priority)}`}>
                {ticket.priority.toUpperCase() === "HIGH" && (
                  <ShieldAlert className="inline w-3.5 h-3.5 mr-1 align-text-bottom" />
                )}
                {ticket.priority === "LOW" ? "Low" : ticket.priority === "MEDIUM" ? "Medium" : "High"}
              </td>
              {/* SUBMITTER */}
              {isItStaff && (
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{ticket.user?.name}</span>
                    <span className="text-xs text-zinc-400 font-mono">{ticket.user?.email}</span>
                  </div>
                </td>
              )}
              {/* STATUS */}
              <td className="px-6 py-4">
                {isItStaff && onStatusChange ? (
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusSelect(ticket.id, e.target.value)}
                    className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1 font-mono tracking-wide focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 dark:focus:ring-zinc-600 dark:focus:border-zinc-600 cursor-pointer"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                ) : (
                  <StatusBadge status={ticket.status} />
                )}
              </td>
              {/* DATE */}
              <td className="px-6 py-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              {/* ACTIONS */}
              <td className="px-6 py-4 text-right">
                <div className="inline-flex items-center space-x-2.5">
                  {ticket._count && ticket._count.comments > 0 && (
                    <span className="inline-flex items-center text-xs font-mono text-zinc-400 mr-1">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      {ticket._count.comments}
                    </span>
                  )}
                  <Link
                    href={isItStaff ? `/dashboard/it/ticket/${ticket.id}` : `/dashboard/employee/ticket/${ticket.id}`}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 dark:hover:hover:text-zinc-100 transition-colors"
                    title="View Details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete Ticket"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
