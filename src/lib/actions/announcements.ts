"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { announcements, announcementPuroks } from "@/db/schema";
import { announcementSchema, type AnnouncementInput } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getAnnouncementsForPurokCached } from "@/lib/cached-queries";

type ActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ── Create announcement ───────────────────────────────────────────────────────

export async function createAnnouncement(
  raw: AnnouncementInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = announcementSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { title, body, type, targetAllPuroks, purokIds, expiresAt, isActive } =
    parsed.data;

  try {
    const results = await db
      .insert(announcements)
      .values({
        title,
        body,
        type,
        targetAllPuroks,
        isActive,
        authorId: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning({ id: announcements.id });

    const newAnnouncement = results[0];
    if (!newAnnouncement || !newAnnouncement.id) {
      return { success: false, error: "Failed to create announcement record." };
    }

    // Insert targeted purok join rows if not a broadcast
    if (!targetAllPuroks && purokIds?.length) {
      await db.insert(announcementPuroks).values(
        purokIds.map((purokId) => ({
          announcementId: newAnnouncement.id,
          purokId,
        }))
      );
    }

    revalidatePath("/admin");
    revalidatePath("/portal");
    revalidateTag(CACHE_TAGS.announcements);

    return {
      success: true,
      data: { id: newAnnouncement.id },
      message: "Announcement published successfully.",
    };
  } catch (error: any) {
    console.error("Database insert failed for announcement:", error);
    return { success: false, error: "A database error occurred while creating the announcement." };
  }
}

// ── Delete / deactivate announcement ─────────────────────────────────────────

export async function deleteAnnouncement(
  id: string
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const updatedRows = await db
      .update(announcements)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning({ id: announcements.id });

    if (!updatedRows || updatedRows.length === 0) {
      return { success: false, error: "Announcement not found or already removed." };
    }

    revalidatePath("/admin");
    revalidatePath("/portal");
    revalidateTag(CACHE_TAGS.announcements);

    return { success: true, data: undefined, message: "Announcement removed." };
  } catch (error: any) {
    console.error("Database delete failed for announcement:", error);
    return { success: false, error: "A database error occurred while removing the announcement." };
  }
}

// ── Fetch active announcements for a specific Purok ───────────────────────────

export async function getAnnouncementsForPurok(purokId: string) {
  return getAnnouncementsForPurokCached(purokId);
}
