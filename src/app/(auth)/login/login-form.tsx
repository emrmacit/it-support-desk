"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("A connection error occurred. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex items-start text-red-700 dark:text-red-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="employee@company.com or it@company.com"
          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          required
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Password
          </label>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      <div className="p-3 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 rounded space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">Demo Credentials:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
          <div>
            <p className="font-semibold text-zinc-600 dark:text-zinc-400">Employee 1</p>
            <p className="text-[9px]">employee@company.com</p>
            <p className="text-[9px]">Pass: password123</p>
          </div>
          <div>
            <p className="font-semibold text-zinc-600 dark:text-zinc-400">Employee 2</p>
            <p className="text-[9px]">employee2@company.com</p>
            <p className="text-[9px]">Pass: password123</p>
          </div>
          <div>
            <p className="font-semibold text-zinc-650 dark:text-zinc-450">IT Staff</p>
            <p className="text-[9px]">it@company.com</p>
            <p className="text-[9px]">Pass: password123</p>
          </div>
        </div>
      </div>
    </form>
  );
}

