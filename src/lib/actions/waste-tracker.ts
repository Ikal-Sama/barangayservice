"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { wasteSchedules } from "@/db/schema";
import {
  wasteStatusUpdateSchema,
  wasteScheduleCreateSchema,
  type WasteStatusUpdateInput,
  type WasteScheduleCreateInput,
} from "@/lib/validations";
import { eq } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getTodaySchedulesCached } from "@/lib/cached-queries";

// ── Shared response type ──────────────────────────────────────────────────────

type ActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ── Update waste collection status ────────────────────────────────────────────

export async function updateWasteStatus(
  raw: WasteStatusUpdateInput
): Promise<ActionResult<{ scheduleId: string; status: string }>> {
  // 1. Auth guard – only admin or operator can update
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  // 2. Validate input with Zod
  const parsed = wasteStatusUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    return { success: false, error: "Validation failed.", fieldErrors };
  }

  const { scheduleId, status, notes } = parsed.data;

  // 3. Build partial update — set timestamp fields based on status
  const now = new Date();
  const updatePayload: Partial<typeof wasteSchedules.$inferInsert> = {
    status,
    notes: notes ?? null,
    updatedById: session.user.id,
    updatedAt: now,
  };

  if (status === "collecting") updatePayload.arrivedAt = now;
  if (status === "completed") updatePayload.completedAt = now;

  // 4. Drizzle update
  const result = await db
    .update(wasteSchedules)
    .set(updatePayload)
    .where(eq(wasteSchedules.id, scheduleId))
    .returning({ id: wasteSchedules.id, status: wasteSchedules.status });

  if (!result.length) {
    return { success: false, error: "Schedule not found." };
  }

  // 5. Revalidate both the admin panel and resident portal
  revalidatePath("/basura");
  revalidatePath("/portal");
  revalidatePath("/admin");
  revalidateTag(CACHE_TAGS.wasteSchedules);

  return {
    success: true,
    data: { scheduleId: result[0].id, status: result[0].status },
    message: `Status updated to "${status}" successfully.`,
  };
}

// ── Get today's schedules for all puroks ─────────────────────────────────────

export async function getTodaySchedules() {
  return getTodaySchedulesCached(new Date().toISOString().slice(0, 10));
}

// ── Create a new waste schedule ───────────────────────────────────────────────

export async function createWasteSchedule(
  raw: WasteScheduleCreateInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  const parsed = wasteScheduleCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { purokId, scheduledDate, notes } = parsed.data;

  const [schedule] = await db
    .insert(wasteSchedules)
    .values({
      purokId,
      scheduledDate: new Date(scheduledDate),
      status: "scheduled",
      notes: notes ?? null,
      updatedById: session.user.id,
    })
    .returning({ id: wasteSchedules.id });

  revalidatePath("/basura");
  revalidatePath("/portal");
  revalidatePath("/admin");
  revalidateTag(CACHE_TAGS.wasteSchedules);

  return {
    success: true,
    data: { id: schedule.id },
    message: "Schedule created successfully.",
  };
}

// ── Delete a waste schedule ───────────────────────────────────────────────────

export async function deleteWasteSchedule(
  scheduleId: string
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  const result = await db
    .delete(wasteSchedules)
    .where(eq(wasteSchedules.id, scheduleId))
    .returning({ id: wasteSchedules.id });

  if (!result.length) {
    return { success: false, error: "Schedule not found." };
  }

  revalidatePath("/basura");
  revalidatePath("/portal");
  revalidatePath("/admin");
  revalidateTag(CACHE_TAGS.wasteSchedules);

  return { success: true, data: undefined, message: "Schedule deleted." };
}
