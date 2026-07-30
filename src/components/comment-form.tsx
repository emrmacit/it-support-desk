"use client";

import React, { useRef, useTransition } from "react";
import { addCommentAction } from "@/app/actions";
import { Send, Loader2 } from "lucide-react";

export function CommentForm({ ticketId }: { ticketId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await addCommentAction(ticketId, formData);
      if (res.success) {
        formRef.current?.reset();
      } else {
        alert(res.error || "An error occurred while adding your comment.");
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="content" className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Add Note / Comment
        </label>
        <textarea
          id="content"
          name="content"
          rows={3}
          placeholder="Enter resolution steps or notes for the submitter..."
          className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          required
          disabled={isPending}
        ></textarea>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center px-4 py-2 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 mr-2" />
              Add Comment
            </>
          )}
        </button>
      </div>
    </form>
  );
}

