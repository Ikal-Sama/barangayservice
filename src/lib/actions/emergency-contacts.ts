"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { emergencyContacts } from "@/db/schema";
import { emergencyContactSchema, type EmergencyContactInput } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getAllEmergencyContactsCached } from "@/lib/cached-queries";

type ActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ── Create ────────────────────────────────────────────────────────────────────

export async function createEmergencyContact(
  raw: EmergencyContactInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = emergencyContactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const [contact] = await db
    .insert(emergencyContacts)
    .values(parsed.data)
    .returning({ id: emergencyContacts.id });

  revalidatePath("/admin/contacts");
  revalidatePath("/portal");
  revalidateTag(CACHE_TAGS.emergencyContacts);

  return { success: true, data: { id: contact.id }, message: "Contact added." };
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateEmergencyContact(
  id: string,
  raw: EmergencyContactInput
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = emergencyContactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db
    .update(emergencyContacts)
    .set(parsed.data)
    .where(eq(emergencyContacts.id, id));

  revalidatePath("/admin/contacts");
  revalidatePath("/portal");
  revalidateTag(CACHE_TAGS.emergencyContacts);

  return { success: true, data: undefined, message: "Contact updated." };
}

// ── Delete (soft – set isActive false) ────────────────────────────────────────

export async function deleteEmergencyContact(
  id: string
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized." };
  }

  await db
    .update(emergencyContacts)
    .set({ isActive: false })
    .where(eq(emergencyContacts.id, id));

  revalidatePath("/admin/contacts");
  revalidatePath("/portal");
  revalidateTag(CACHE_TAGS.emergencyContacts);

  return { success: true, data: undefined, message: "Contact removed." };
}

// ── Fetch all (admin view) ────────────────────────────────────────────────────

export async function getAllEmergencyContacts() {
  return getAllEmergencyContactsCached();
}
