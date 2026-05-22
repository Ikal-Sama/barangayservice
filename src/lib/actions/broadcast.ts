"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, type SQL } from "drizzle-orm";
import { notificationService } from "@/lib/notifications/notificationService";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Broadcast a message to residents/admins.
 * Filters:
 *   - purokId: optional UUID to limit to a specific purok
 *   - role: "admin" | "resident" | undefined (all)
 */
export async function broadcastMessage(params: {
  subject: string;
  html: string;
  purokId?: string;
  role?: "admin" | "resident";
  userId?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Build where clause based on optional filters
  const conditions = [] as Array<SQL>;
  if (params.purokId) conditions.push(eq(users.purokId, params.purokId));
  if (params.role) conditions.push(eq(users.role, params.role));
  if (params.userId) conditions.push(eq(users.id, params.userId));

  // Fetch users respecting their notification preferences
  const recipientQuery = db
    .select({ email: users.email, name: users.name, prefers: {
      email: users.notifyEmail,
      sms: users.notifySms,
    } })
    .from(users)
    .where(conditions.length ? and(...conditions) : undefined);

  const recipients = await recipientQuery;

  // Send email to each recipient who opted in for email notifications
  for (const r of recipients) {
    if (r.prefers.email) {
      try {
        await notificationService.sendEmail({
          to: r.email,
          subject: params.subject,
          html: `<p>Hi ${r.name},</p>${params.html}`,
        });
      } catch (err) {
        console.error(`Failed to send email to ${r.email}:`, err);
      }
    }
  }

  // Invalidate any broadcast‑related cache (if any)
  revalidateTag(CACHE_TAGS.broadcast);

  return { success: true, count: recipients.length };
}
