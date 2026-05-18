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

  const [purok] = await db
    .insert(puroks)
    .values(parsed.data)
    .returning({ id: puroks.id });

  revalidatePath("/admin");
  revalidateTag(CACHE_TAGS.puroks);
  return { success: true, data: { id: purok.id }, message: "Purok created." };
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

  await db
    .update(puroks)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(puroks.id, id));

  revalidatePath("/admin");
  revalidateTag(CACHE_TAGS.puroks);
  return { success: true, data: undefined, message: "Purok updated." };
}

// ── Fetch all puroks ──────────────────────────────────────────────────────────

export async function getAllPuroks() {
  return getAllPuroksCached();
}

// ── Fetch active puroks (for dropdowns) ───────────────────────────────────────

export async function getActivePuroks() {
  return getActivePuroksCached();
}
