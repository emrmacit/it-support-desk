"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isRateLimited } from "@/lib/rate-limiter";
import { ticketSchema, statusUpdateSchema, commentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

// Custom type helper for action responses
export type ActionResponse<T = any> = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
};

/**
 * Creates a new IT Support ticket (Employee Action).
 */
export async function createTicketAction(prevState: any, formData: FormData): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "EMPLOYEE") {
    return { success: false, error: "Unauthorized access. Please log in." };
  }

  const userId = session.user.id;

  // Rate Limiting Check (Max 5 requests per minute per user)
  if (isRateLimited(userId)) {
    return {
      success: false,
      error: "Rate limit exceeded. You can submit a maximum of 5 support tickets per minute.",
    };
  }

  // Parse fields
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;

  // Validate with Zod
  const validation = ticketSchema.safeParse({ title, description, category, priority });

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return { success: false, fieldErrors };
  }

  try {
    const ticket = await db.ticket.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        category: validation.data.category,
        priority: validation.data.priority,
        status: "OPEN",
        userId,
      },
    });

    revalidatePath("/dashboard/employee");
    return { success: true, data: { id: ticket.id } };
  } catch (err) {
    console.error("Ticket creation error:", err);
    return { success: false, error: "A system error occurred while creating the support ticket." };
  }
}

/**
 * Updates a ticket status (IT Staff Action).
 */
export async function updateTicketStatusAction(ticketId: string, status: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "IT_STAFF") {
    return { success: false, error: "Unauthorized action." };
  }

  // Validate status with Zod
  const validation = statusUpdateSchema.safeParse({ status });

  if (!validation.success) {
    return { success: false, error: "Invalid status value." };
  }

  try {
    const updatedTicket = await db.ticket.update({
      where: { id: ticketId },
      data: { status: validation.data.status },
    });

    // Create system notification for ticket owner
    const statusLabel =
      status === "OPEN"
        ? "OPEN"
        : status === "IN_PROGRESS"
        ? "IN PROGRESS"
        : status === "RESOLVED"
        ? "RESOLVED"
        : "CLOSED";

    await db.notification.create({
      data: {
        userId: updatedTicket.userId,
        ticketId: updatedTicket.id,
        message: `The status of your support ticket (#${updatedTicket.id.substring(0, 8)}) was updated to "${statusLabel}".`,
      },
    });

    revalidatePath("/dashboard/it");
    revalidatePath(`/dashboard/it/ticket/${ticketId}`);
    revalidatePath("/dashboard/employee");
    return { success: true };
  } catch (err) {
    console.error("Ticket status update error:", err);
    return { success: false, error: "An error occurred while updating ticket status." };
  }
}

/**
 * Adds an internal comment/log to a ticket (Both Roles).
 */
export async function addCommentAction(ticketId: string, formData: FormData): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, error: "Please log in." };
  }

  const content = formData.get("content") as string;
  const validation = commentSchema.safeParse({ content });

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return { success: false, error: errors.content?.[0] || "Invalid comment." };
  }

  try {
    // Check if the ticket exists
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: "Support ticket not found." };
    }

    // RBAC logic for viewing/commenting
    if (session.user.role === "EMPLOYEE" && ticket.userId !== session.user.id) {
      return { success: false, error: "You do not have permission for this action." };
    }

    // Lock check: Employees cannot comment on closed/resolved tickets
    if (session.user.role === "EMPLOYEE" && (ticket.status === "CLOSED" || ticket.status === "RESOLVED")) {
      return { success: false, error: "This support ticket is resolved or closed, so new comments cannot be added." };
    }

    // Insert comment
    await db.comment.create({
      data: {
        content: validation.data.content,
        userId: session.user.id,
        ticketId,
      },
    });

    // Auto-update status: If IT staff replies and the ticket is OPEN, mark it as IN_PROGRESS
    if (session.user.role === "IT_STAFF" && ticket.status === "OPEN") {
      await db.ticket.update({
        where: { id: ticketId },
        data: { status: "IN_PROGRESS" },
      });
      revalidatePath("/dashboard/it");
    }

    // Create Notification: If IT staff comments, notify the Employee
    if (session.user.role === "IT_STAFF") {
      await db.notification.create({
        data: {
          userId: ticket.userId,
          ticketId: ticket.id,
          message: `A new IT note/comment was added to your support ticket (#${ticket.id.substring(0, 8)}).`,
        },
      });
    }

    revalidatePath(`/dashboard/it/ticket/${ticketId}`);
    revalidatePath("/dashboard/employee");
    return { success: true };
  } catch (err) {
    console.error("Add comment error:", err);
    return { success: false, error: "An error occurred while adding your comment." };
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsReadAction(notificationId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, error: "Unauthorized action." };
  }

  try {
    await db.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Mark notification read error:", err);
    return { success: false, error: "An error occurred." };
  }
}

/**
 * Marks all notifications as read for the logged-in user.
 */
export async function markAllNotificationsAsReadAction(): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, error: "Unauthorized action." };
  }

  try {
    await db.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Mark all notifications read error:", err);
    return { success: false, error: "An error occurred." };
  }
}

/**
 * Fetches recent unread notifications for header display.
 */
export async function getUnreadNotificationsAction(): Promise<ActionResponse<any[]>> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, error: "Unauthorized action.", data: [] };
  }

  try {
    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return { success: true, data: notifications };
  } catch (err) {
    console.error("Get notifications error:", err);
    return { success: false, error: "An error occurred.", data: [] };
  }
}

/**
 * Reopens a ticket (Both Employees and IT Staff).
 */
export async function reopenTicketAction(ticketId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, error: "Unauthorized access. Please log in." };
  }

  try {
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: "Support ticket not found." };
    }

    if (session.user.role === "EMPLOYEE" && ticket.userId !== session.user.id) {
      return { success: false, error: "You do not have permission to reopen this ticket." };
    }

    await db.ticket.update({
      where: { id: ticketId },
      data: { status: "OPEN" },
    });

    // Add log comment
    const actorName = session.user.name || (session.user.role === "IT_STAFF" ? "IT Staff" : "Ticket Submitter");
    await db.comment.create({
      data: {
        content: `[System] Ticket was reopened by ${actorName}.`,
        userId: session.user.id,
        ticketId,
      },
    });

    // Create notification if reopened by employee
    if (session.user.role === "EMPLOYEE") {
      const itStaff = await db.user.findFirst({ where: { role: "IT_STAFF" } });
      if (itStaff) {
        await db.notification.create({
          data: {
            userId: itStaff.id,
            ticketId,
            message: `User ${actorName} reopened ticket #${ticketId.substring(0, 8)}.`,
          },
        });
      }
    }

    revalidatePath("/dashboard/employee");
    revalidatePath(`/dashboard/employee/ticket/${ticketId}`);
    revalidatePath("/dashboard/it");
    revalidatePath(`/dashboard/it/ticket/${ticketId}`);
    return { success: true };
  } catch (err) {
    console.error("Reopen ticket error:", err);
    return { success: false, error: "An error occurred while reopening the ticket." };
  }
}

/**
 * Deletes a ticket (Creator Employee or IT Staff).
 */
export async function deleteTicketAction(ticketId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, error: "Unauthorized access. Please log in." };
  }

  try {
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: "Support ticket not found." };
    }

    // Role check: Employee can only delete their own tickets; IT staff can delete any.
    if (session.user.role === "EMPLOYEE" && ticket.userId !== session.user.id) {
      return { success: false, error: "You do not have permission to delete this support ticket." };
    }

    await db.ticket.delete({
      where: { id: ticketId },
    });

    revalidatePath("/dashboard/employee");
    revalidatePath("/dashboard/it");
    return { success: true };
  } catch (err) {
    console.error("Delete ticket error:", err);
    return { success: false, error: "An error occurred while deleting the support ticket." };
  }
}


