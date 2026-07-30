import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TicketForm } from "@/components/ticket-form";

export default async function CreateTicketPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "EMPLOYEE") {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Create New Support Ticket
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Fill out the form below to submit a technical issue or request to the IT team.
        </p>
      </div>

      <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg">
        <TicketForm />
      </div>
    </div>
  );
}
