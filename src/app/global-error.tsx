"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
        <div className="flex flex-col items-center text-center max-w-md p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg space-y-6 shadow-sm">
          <div className="p-3 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Critical System Error
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              A critical root-level error occurred while running the application. You can try refreshing the page or try again later.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <button
              onClick={() => reset()}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              Reload Application
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="w-full px-4 py-2.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium transition-colors cursor-pointer"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
