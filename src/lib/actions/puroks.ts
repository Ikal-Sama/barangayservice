"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { puroks } from "@/db/schema";
import { purokSchema, type PurokInput } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getActivePuroksCached, getAllPuroksCached } from "@/lib/cached-queries";

type ActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ── Create Purok ──────────────────────────────────────────────────────────────

export async function createPurok(
  raw: PurokInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = purokSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const results = await db
      .insert(puroks)
      .values(parsed.data)
      .returning({ id: puroks.id });

    const purok = results[0];
    if (!purok || !purok.id) {
      return { success: false, error: "Failed to create purok record." };
    }

    revalidatePath("/admin");
    revalidateTag(CACHE_TAGS.puroks);
    return { success: true, data: { id: purok.id }, message: "Purok created." };
  } catch (error: any) {
    console.error("Database insert failed for purok:", error);
    return { success: false, error: "A database error occurred while creating the purok." };
  }
}

// ── Update Purok ──────────────────────────────────────────────────────────────

export async function updatePurok(
  id: string,
  raw: PurokInput
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = purokSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const updatedRows = await db
      .update(puroks)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(puroks.id, id))
      .returning({ id: puroks.id });

    if (!updatedRows || updatedRows.length === 0) {
      return { success: false, error: "Purok not found or no changes were made." };
    }

    revalidatePath("/admin");
    revalidateTag(CACHE_TAGS.puroks);
    return { success: true, data: undefined, message: "Purok updated." };
  } catch (error: any) {
    console.error("Database update failed for purok:", error);
    return { success: false, error: "A database error occurred while updating the purok." };
  }
}

// ── Fetch all puroks ──────────────────────────────────────────────────────────

export async function getAllPuroks() {
  return getAllPuroksCached();
}

// ── Fetch active puroks (for dropdowns) ───────────────────────────────────────

export async function getActivePuroks() {
  return getActivePuroksCached();
}
