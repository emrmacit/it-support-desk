import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TicketTable } from "@/components/ticket-table";
import { updateTicketStatusAction } from "@/app/actions";
import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ItDashboardPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "IT_STAFF") {
    redirect("/login");
  }

  // Resolve search parameters as required in Next.js 15+ App Router
  const params = await searchParams;
  const statusFilter = params.status;
  const priorityFilter = params.priority;
  const categoryFilter = params.category;
  const sortOrder = params.sort === "asc" ? "asc" : "desc";
  
  // Resolve pagination page number
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 10;

  // Build filter conditions
  const where: any = {};
  if (statusFilter) where.status = statusFilter;
  if (priorityFilter) where.priority = priorityFilter;
  if (categoryFilter) where.category = categoryFilter;

  // Fetch count first to safely calculate offset skipped
  const totalCount = await db.ticket.count({ where });
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const skip = (currentPage - 1) * limit;

  // Query tickets with pagination
  const tickets = await db.ticket.findMany({
    where,
    orderBy: { createdAt: sortOrder },
    skip,
    take: limit,
    include: {
      user: {
        select: { name: true, email: true },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  // Query overall statistics for the panel
  const allTickets = await db.ticket.findMany({
    select: { status: true },
  });

  const stats = {
    total: allTickets.length,
    open: allTickets.filter((t) => t.status === "OPEN").length,
    inProgress: allTickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: allTickets.filter((t) => t.status === "RESOLVED").length,
    closed: allTickets.filter((t) => t.status === "CLOSED").length,
  };

  const getFilterUrl = (key: string, value: string | null) => {
    const currentParams = new URLSearchParams();
    if (statusFilter && key !== "status") currentParams.set("status", statusFilter);
    if (priorityFilter && key !== "priority") currentParams.set("priority", priorityFilter);
    if (categoryFilter && key !== "category") currentParams.set("category", categoryFilter);
    if (params.sort && key !== "sort") currentParams.set("sort", params.sort);

    // Reset pagination to page 1 on filter changes. Keep page only when navigating page.
    if (params.page && key === "page") {
      currentParams.set("page", params.page);
    } else if (key !== "page") {
      currentParams.delete("page");
    }

    if (value) {
      currentParams.set(key, value);
    } else {
      currentParams.delete(key);
    }

    const query = currentParams.toString();
    return `/dashboard/it${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          IT Control Panel
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor, prioritize, and manage all company-wide IT support tickets.
        </p>
      </div>

      {/* IT Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Total Tickets</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{stats.total}</p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg">
          <p className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-500">Open</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{stats.open}</p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg">
          <p className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-500">In Progress</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{stats.inProgress}</p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg">
          <p className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-500">Resolved</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{stats.resolved}</p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg col-span-2 md:col-span-1">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Closed</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{stats.closed}</p>
        </div>
      </div>

      {/* Filters and Sorting Bar */}
      <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center text-xs font-mono text-zinc-400 mr-1">
            <Filter className="w-3.5 h-3.5 mr-1" />
            FILTERS:
          </div>

          {/* Status Filter */}
          <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-0.5">
            <Link
              href={getFilterUrl("status", null)}
              className={`px-2.5 py-1 text-xs rounded transition-colors font-mono ${
                !statusFilter
                  ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              All
            </Link>
            {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
              <Link
                key={s}
                href={getFilterUrl("status", s)}
                className={`px-2.5 py-1 text-xs rounded transition-colors font-mono ${
                  statusFilter === s
                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {s === "OPEN" ? "Open" : s === "IN_PROGRESS" ? "In Progress" : s === "RESOLVED" ? "Resolved" : "Closed"}
              </Link>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-0.5">
            <Link
              href={getFilterUrl("priority", null)}
              className={`px-2.5 py-1 text-xs rounded transition-colors font-mono ${
                !priorityFilter
                  ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Priority
            </Link>
            {["LOW", "MEDIUM", "HIGH"].map((p) => (
              <Link
                key={p}
                href={getFilterUrl("priority", p)}
                className={`px-2.5 py-1 text-xs rounded transition-colors font-mono ${
                  priorityFilter === p
                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {p === "LOW" ? "Low" : p === "MEDIUM" ? "Medium" : "High"}
              </Link>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-0.5">
            <Link
              href={getFilterUrl("category", null)}
              className={`px-2.5 py-1 text-xs rounded transition-colors font-mono ${
                !categoryFilter
                  ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Category
            </Link>
            {["HARDWARE", "SOFTWARE", "NETWORK", "ACCESS"].map((c) => (
              <Link
                key={c}
                href={getFilterUrl("category", c)}
                className={`px-2.5 py-1 text-xs rounded transition-colors font-mono ${
                  categoryFilter === c
                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {c === "HARDWARE" ? "Hardware" : c === "SOFTWARE" ? "Software" : c === "NETWORK" ? "Network" : "Access"}
              </Link>
            ))}
          </div>
        </div>

        {/* Sorting & Reset */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Date Sort Toggle */}
          <Link
            href={getFilterUrl("sort", sortOrder === "desc" ? "asc" : "desc")}
            className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-1.5 font-mono text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            Date: {sortOrder === "desc" ? "Newest First ↓" : "Oldest First ↑"}
          </Link>

          {(statusFilter || priorityFilter || categoryFilter || params.sort) && (
            <Link
              href="/dashboard/it"
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300 dark:hover:hover:text-zinc-50 transition-colors"
              title="Clear Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Ticket Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">All Tickets</h2>
        <TicketTable tickets={tickets} isItStaff={true} onStatusChange={updateTicketStatusAction} />
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4 gap-4 font-mono text-xs">
          <p className="text-zinc-500 text-center sm:text-left">
            Showing {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalCount)} of {totalCount} tickets.
          </p>
          <div className="flex items-center space-x-3">
            <Link
              href={currentPage > 1 ? getFilterUrl("page", String(currentPage - 1)) : "#"}
              className={`px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded transition-colors ${
                currentPage > 1
                  ? "bg-white hover:bg-zinc-50 text-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-zinc-300"
                  : "bg-zinc-50/50 text-zinc-400 dark:bg-zinc-900/30 cursor-not-allowed pointer-events-none"
              }`}
            >
              Previous
            </Link>
            <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
              {currentPage} / {totalPages}
            </span>
            <Link
              href={currentPage < totalPages ? getFilterUrl("page", String(currentPage + 1)) : "#"}
              className={`px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded transition-colors ${
                currentPage < totalPages
                  ? "bg-white hover:bg-zinc-50 text-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-zinc-300"
                  : "bg-zinc-50/50 text-zinc-400 dark:bg-zinc-900/30 cursor-not-allowed pointer-events-none"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
