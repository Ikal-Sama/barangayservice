"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { incidentReports } from "@/db/schema";
import {
  incidentReportSchema,
  updateIncidentReportStatusSchema,
  type IncidentReportInput,
  type UpdateIncidentReportStatusInput,
} from "@/lib/validations";
import { eq, desc, count } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";

type ActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ── Create Incident Report ───────────────────────────────────────────────────

export async function createIncidentReport(
  raw: IncidentReportInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = incidentReportSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { title, category, description, purokId } = parsed.data;

  const [newReport] = await db
    .insert(incidentReports)
    .values({
      userId: session.user.id,
      purokId: purokId || null,
      category,
      title,
      description,
      status: "pending",
    })
    .returning({ id: incidentReports.id });

  revalidatePath("/portal/reports");
  revalidatePath("/admin/reports");
  revalidateTag(CACHE_TAGS.incidentReports);

  return {
    success: true,
    data: { id: newReport.id },
    message: "Report submitted successfully.",
  };
}

// ── Update Incident Report Status ─────────────────────────────────────────────

export async function updateIncidentReportStatus(
  raw: UpdateIncidentReportStatusInput
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = updateIncidentReportStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { id, status, adminNotes } = parsed.data;

  await db
    .update(incidentReports)
    .set({
      status,
      adminNotes: adminNotes || null,
      updatedAt: new Date(),
    })
    .where(eq(incidentReports.id, id));

  revalidatePath("/portal/reports");
  revalidatePath("/admin/reports");
  revalidateTag(CACHE_TAGS.incidentReports);

  return { success: true, data: undefined, message: "Report status updated." };
}

// ── Fetch User Incident Reports ───────────────────────────────────────────────

export async function getUserIncidentReports() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  return await db.query.incidentReports.findMany({
    where: eq(incidentReports.userId, session.user.id),
    orderBy: [desc(incidentReports.createdAt)],
    with: {
      purok: true,
    },
  });
}

// ── Fetch All Incident Reports ────────────────────────────────────────────────

export async function getAllIncidentReports() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return [];

  return await db.query.incidentReports.findMany({
    orderBy: [desc(incidentReports.createdAt)],
    with: {
      user: {
        with: {
          purok: true,
        },
      },
      purok: true,
    },
  });
}

// ── Fetch Pending Reports Count ───────────────────────────────────────────────

export async function getPendingReportsCount() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return 0;

  const countQuery = await db
    .select({ value: count() })
    .from(incidentReports)
    .where(eq(incidentReports.status, "pending"));

  return countQuery[0]?.value || 0;
}
