import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/status-badge";
import { CommentForm } from "@/components/comment-form";
import { TicketStatusSelect } from "@/components/ticket-status-select";
import { DeleteTicketButton } from "@/components/ticket-actions";
import Link from "next/link";
import { ArrowLeft, Clock, User, Shield, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "IT_STAFF") {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch ticket details with comments and user relations
  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, email: true },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: { name: true, role: true },
          },
        },
      },
    },
  });

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/it"
          className="inline-flex items-center text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          BACK TO CONTROL PANEL
        </Link>
        <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg text-center space-y-2">
          <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Ticket not found.</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">The support ticket you are looking for might have been deleted or cannot be found.</p>
        </div>
      </div>
    );
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "HIGH":
        return "text-red-600 dark:text-red-400 font-semibold";
      case "MEDIUM":
        return "text-amber-600 dark:text-amber-400 font-semibold";
      case "LOW":
        return "text-zinc-500 dark:text-zinc-450";
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

  return (
    <div className="space-y-6">
      {/* Back Link & Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/it"
          className="inline-flex items-center text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          BACK TO ALL TICKETS
        </Link>
        <div className="flex items-center space-x-3">
          <TicketStatusSelect ticketId={ticket.id} initialStatus={ticket.status} />
          <DeleteTicketButton ticketId={ticket.id} redirectUrl="/dashboard/it" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg space-y-6">
            {/* Meta row */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                TICKET ID: #{ticket.id}
              </span>
              <div className="flex items-center space-x-3">
                <StatusBadge status={ticket.status} />
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 leading-tight">
                {ticket.title}
              </h1>
            </div>

            {/* Detail metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 rounded font-mono text-xs">
              <div>
                <p className="text-zinc-400">Category</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  {getCategoryLabel(ticket.category)}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Priority</p>
                <p className={`font-semibold mt-1 ${getPriorityStyle(ticket.priority)}`}>
                  {ticket.priority === "LOW" ? "LOW" : ticket.priority === "MEDIUM" ? "MEDIUM" : "HIGH"}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-zinc-400">Created Date</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Description / Ticket Details
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Submitter User Panel */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4">
              Submitter Information
            </h3>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-full">
                <User className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">{ticket.user?.name}</p>
                <p className="text-xs font-mono text-zinc-400">{ticket.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Internal Logs & Comments Panel */}
        <div className="space-y-6">
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg space-y-6">
            <h2 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-900 pb-3 flex items-center justify-between">
              <span className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-zinc-400" />
                Activity Logs
              </span>
              <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded">
                {ticket.comments.length}
              </span>
            </h2>

            {/* Comments Thread */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {ticket.comments.length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-4">
                  No activity log recorded for this ticket yet.
                </p>
              ) : (
                ticket.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded border text-xs space-y-1.5 ${
                      comment.user.role === "IT_STAFF"
                        ? "bg-zinc-50/70 border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-900/50"
                        : "bg-blue-50/30 border-blue-100 dark:bg-blue-950/5 dark:border-blue-900/20"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center">
                        {comment.user.role === "IT_STAFF" && (
                          <Shield className="w-3 h-3 text-zinc-500 mr-1 flex-shrink-0" />
                        )}
                        {comment.user.name}
                      </span>
                      <span className="font-mono text-zinc-400">
                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {/* Content */}
                    <p className="text-zinc-800 dark:text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4">
              <CommentForm ticketId={ticket.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
