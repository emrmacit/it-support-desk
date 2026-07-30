"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error securely to backend or logging service
    console.error("Dashboard Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg text-center max-w-lg mx-auto my-12 space-y-6">
      <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full">
        <AlertCircle className="w-8 h-8" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
          An Error Occurred
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          An unexpected technical error occurred while processing your request. Error details have been hidden for security.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center px-4 py-2 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm font-semibold transition-colors duration-150 cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </button>
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="px-4 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium transition-colors duration-150 cursor-pointer"
        >
          Reload Dashboard
        </button>
      </div>
    </div>
  );
}
