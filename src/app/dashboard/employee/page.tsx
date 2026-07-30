import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TicketTable } from "@/components/ticket-table";
import Link from "next/link";
import { Plus, HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "EMPLOYEE") {
    redirect("/login");
  }

  // Fetch only tickets submitted by this employee
  const tickets = await db.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Page Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            My Support Tickets
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track your submitted support tickets and their real-time status.
          </p>
        </div>
        <Link
          href="/dashboard/employee/create"
          className="inline-flex items-center justify-center px-4 py-2 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm font-semibold transition-colors duration-150 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Support Ticket
        </Link>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">ALL TICKETS</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{tickets.length}</p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg">
          <p className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-500">OPEN</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {tickets.filter((t) => t.status === "OPEN").length}
          </p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg">
          <p className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-500">IN PROGRESS</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {tickets.filter((t) => t.status === "IN_PROGRESS").length}
          </p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg">
          <p className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-500">RESOLVED</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {tickets.filter((t) => t.status === "RESOLVED").length}
          </p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg col-span-2 md:col-span-1">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">CLOSED</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {tickets.filter((t) => t.status === "CLOSED").length}
          </p>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Tickets List</h2>
        <TicketTable tickets={tickets} isItStaff={false} />
      </div>
    </div>
  );
}
