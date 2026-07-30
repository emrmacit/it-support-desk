"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ticketSchema } from "@/lib/validations";
import { createTicketAction } from "@/app/actions";
import { AlertCircle, Loader2 } from "lucide-react";
import { z } from "zod";

type TicketFormData = z.infer<typeof ticketSchema>;

export function TicketForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      priority: undefined,
    },
  });

  const onSubmit = (data: TicketFormData) => {
    setError(null);

    // Prepare FormData for Next.js Server Action
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("priority", data.priority);

    startTransition(async () => {
      const res = await createTicketAction(null, formData);
      if (res.success) {
        router.push("/dashboard/employee");
      } else {
        if (res.error) {
          setError(res.error);
        } else if (res.fieldErrors) {
          const firstError = Object.values(res.fieldErrors)[0]?.[0];
          setError(firstError || "Form validation failed.");
        } else {
          setError("An error occurred while saving your support ticket.");
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* General Error Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex items-start text-red-800 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Ticket Title
        </label>
        <input
          id="title"
          type="text"
          placeholder="e.g., Outlook won't launch, displaying license error"
          className={`w-full px-3.5 py-2 border rounded bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 ${
            errors.title
              ? "border-red-500 focus:ring-red-500"
              : "border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          } placeholder:text-zinc-400 dark:placeholder:text-zinc-600`}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-mono">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Category
          </label>
          <select
            id="category"
            className={`w-full px-3.5 py-2 border rounded bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 cursor-pointer ${
              errors.category
                ? "border-red-500 focus:ring-red-500"
                : "border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            }`}
            {...register("category")}
          >
            <option value="" disabled>Select Category</option>
            <option value="HARDWARE">Hardware (Display, Mouse, Laptop, etc.)</option>
            <option value="SOFTWARE">Software (Office, OS, Apps, etc.)</option>
            <option value="NETWORK">Network / Internet (Wi-Fi, VPN, etc.)</option>
            <option value="ACCESS">Access / Permissions (Files, Mail, CRM, etc.)</option>
          </select>
          {errors.category && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-mono">{errors.category.message}</p>
          )}
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="priority" className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Priority Level
          </label>
          <select
            id="priority"
            className={`w-full px-3.5 py-2 border rounded bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 cursor-pointer ${
              errors.priority
                ? "border-red-500 focus:ring-red-500"
                : "border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            }`}
            {...register("priority")}
          >
            <option value="" disabled>Select Priority</option>
            <option value="LOW">Low (Minor issue / Does not block work)</option>
            <option value="MEDIUM">Medium (Workflow impacted / Alternative exists)</option>
            <option value="HIGH">High (Critical issue / Work completely blocked)</option>
          </select>
          {errors.priority && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-mono">{errors.priority.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Detailed Description
        </label>
        <textarea
          id="description"
          rows={6}
          placeholder="Please describe your issue in detail. Include any error codes or messages if applicable."
          className={`w-full px-3.5 py-2 border rounded bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 ${
            errors.description
              ? "border-red-500 focus:ring-red-500"
              : "border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          } placeholder:text-zinc-400 dark:placeholder:text-zinc-600`}
          {...register("description")}
        ></textarea>
        {errors.description && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-mono">{errors.description.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center px-5 py-2 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm font-semibold transition-colors duration-155 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Create Ticket"
          )}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => router.back()}
          className="px-5 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium transition-colors duration-155 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

