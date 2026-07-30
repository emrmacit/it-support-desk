import { z } from "zod";

export const ticketSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters long." })
    .max(100, { message: "Title cannot exceed 100 characters." })
    .trim(),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long." })
    .max(1000, { message: "Description cannot exceed 1000 characters." })
    .trim(),
  category: z.enum(["HARDWARE", "SOFTWARE", "NETWORK", "ACCESS"], {
    message: "Please select a valid category.",
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
    message: "Please select a valid priority level.",
  }),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"], {
    message: "Invalid status value.",
  }),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(2, { message: "Comment must be at least 2 characters long." })
    .max(500, { message: "Comment cannot exceed 500 characters." })
    .trim(),
});

