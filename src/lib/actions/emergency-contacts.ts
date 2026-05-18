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

  try {
    const results = await db
      .insert(emergencyContacts)
      .values(parsed.data)
      .returning({ id: emergencyContacts.id });

    const contact = results[0];
    if (!contact || !contact.id) {
      return { success: false, error: "Failed to create emergency contact record." };
    }

    revalidatePath("/admin/contacts");
    revalidatePath("/portal");
    revalidateTag(CACHE_TAGS.emergencyContacts);

    return { success: true, data: { id: contact.id }, message: "Contact added." };
  } catch (error: any) {
    console.error("Database insert failed for emergency contact:", error);
    return { success: false, error: "A database error occurred while creating the emergency contact." };
  }
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

  try {
    const updatedRows = await db
      .update(emergencyContacts)
      .set(parsed.data)
      .where(eq(emergencyContacts.id, id))
      .returning({ id: emergencyContacts.id });

    if (!updatedRows || updatedRows.length === 0) {
      return { success: false, error: "Emergency contact not found or no changes were made." };
    }

    revalidatePath("/admin/contacts");
    revalidatePath("/portal");
    revalidateTag(CACHE_TAGS.emergencyContacts);

    return { success: true, data: undefined, message: "Contact updated." };
  } catch (error: any) {
    console.error("Database update failed for emergency contact:", error);
    return { success: false, error: "A database error occurred while updating the emergency contact." };
  }
}

// ── Delete (soft – set isActive false) ────────────────────────────────────────

export async function deleteEmergencyContact(
  id: string
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const updatedRows = await db
      .update(emergencyContacts)
      .set({ isActive: false })
      .where(eq(emergencyContacts.id, id))
      .returning({ id: emergencyContacts.id });

    if (!updatedRows || updatedRows.length === 0) {
      return { success: false, error: "Emergency contact not found or already removed." };
    }

    revalidatePath("/admin/contacts");
    revalidatePath("/portal");
    revalidateTag(CACHE_TAGS.emergencyContacts);

    return { success: true, data: undefined, message: "Contact removed." };
  } catch (error: any) {
    console.error("Database delete failed for emergency contact:", error);
    return { success: false, error: "A database error occurred while removing the emergency contact." };
  }
}

// ── Fetch all (admin view) ────────────────────────────────────────────────────

export async function getAllEmergencyContacts() {
  return getAllEmergencyContactsCached();
}
