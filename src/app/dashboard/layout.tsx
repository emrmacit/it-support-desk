import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { db } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch unread notifications for the logged-in user
  const notifications = await db.notification.findMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20, // Limit to recent 20 unread notifications
  });

  const user = {
    name: session.user.name || "User",
    email: session.user.email || "",
    role: (session.user as any).role || "EMPLOYEE",
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DashboardHeader user={user} initialNotifications={notifications} />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
