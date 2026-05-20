"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notificationService } from "@/lib/notifications/notificationService";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

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
}) {
  // Build where clause based on optional filters
  const conditions = [] as any[];
  if (params.purokId) conditions.push(eq(users.purokId, params.purokId));
  if (params.role) conditions.push(eq(users.role, params.role));

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
      await notificationService.sendEmail({
        to: r.email,
        subject: params.subject,
        html: `<p>Hi ${r.name},</p>${params.html}`,
      });
    }
    // TODO: SMS support when Twilio is configured
  }

  // Invalidate any broadcast‑related cache (if any)
  revalidateTag(CACHE_TAGS.broadcast);

  return { success: true, count: recipients.length };
}
