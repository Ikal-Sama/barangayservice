"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Update a user's notification preferences.
 * Only the authenticated user may update their own preferences.
 */
export async function updateNotificationPreferences(preferences: {
  notifyEmail?: boolean;
  notifySms?: boolean;
  notifyPush?: boolean;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized" } as const;
  }

  // Build update object only with defined fields
  const update: Partial<typeof users.$inferInsert> = {};
  if (typeof preferences.notifyEmail === "boolean") update.notifyEmail = preferences.notifyEmail;
  if (typeof preferences.notifySms   === "boolean") update.notifySms   = preferences.notifySms;
  if (typeof preferences.notifyPush  === "boolean") update.notifyPush  = preferences.notifyPush;

  await db.update(users).set(update).where(eq(users.id, session.user.id));

  // Refresh the profile page after change
  revalidatePath("/profile");

  return { success: true } as const;
}
