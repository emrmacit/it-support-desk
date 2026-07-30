import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            IT Support Desk
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your account with your email and password.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
