"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { documentRequests } from "@/db/schema";
import { documentRequestSchema, updateDocumentRequestStatusSchema, type DocumentRequestInput, type UpdateDocumentRequestStatusInput } from "@/lib/validations";
import { eq, desc, count } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { broadcastMessage } from "@/lib/actions/broadcast";
import { protectFormAction } from "@/lib/arcjet";

type ActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ── Create Document Request ───────────────────────────────────────────────────

export async function createDocumentRequest(
  raw: DocumentRequestInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized." };
  }

  const arcjetDenial = await protectFormAction();
  if (arcjetDenial) {
    return arcjetDenial;
  }

  const parsed = documentRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { type, purpose } = parsed.data;

  const [newRequest] = await db
    .insert(documentRequests)
    .values({
      userId: session.user.id,
      type,
      purpose,
      status: "pending",
    })
    .returning({ id: documentRequests.id });

  revalidatePath("/portal/documents");
  revalidatePath("/admin/documents");
  revalidateTag(CACHE_TAGS.documentRequests);
  // Notify the request owner about the status change
  try {
    await broadcastMessage({
      subject: `Document request status update`,
      html: `<p>Your document request (ID: ${newRequest.id}) is now <strong>pending</strong>.</p>`,
      userId: session.user.id,
    });
  } catch (err) {
    console.error("broadcastMessage failed for request", { requestId: newRequest.id, err });
  }

  return {
    success: true,
    data: { id: newRequest.id },
    message: "Document request submitted successfully.",
  };
}

// ── Update Document Request Status ───────────────────────────────────────────

export async function updateDocumentRequestStatus(
  raw: UpdateDocumentRequestStatusInput
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = updateDocumentRequestStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { id, status, adminNotes } = parsed.data;

  const [updatedReq] = await db
    .update(documentRequests)
    .set({ 
      status, 
      adminNotes: adminNotes || null, 
      updatedAt: new Date() 
    })
    .where(eq(documentRequests.id, id))
    .returning();

  revalidatePath("/portal/documents");
  revalidatePath("/admin/documents");
  revalidateTag(CACHE_TAGS.documentRequests);
  // Notify the request owner about the status change
  if (updatedReq && updatedReq.userId) {
    try {
      await broadcastMessage({
        subject: `Document request status update`,
        html: `<p>Your document request (ID: ${id}) is now <strong>${status}</strong>.</p>`,
        userId: updatedReq.userId,
      });
    } catch (err) {
      console.error("broadcastMessage failed for request", { requestId: id, err });
    }
  }

  return { success: true, data: undefined, message: "Request status updated." };
}

// ── Fetch User Document Requests ─────────────────────────────────────────────

export async function getUserDocumentRequests() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  return await db.query.documentRequests.findMany({
    where: eq(documentRequests.userId, session.user.id),
    orderBy: [desc(documentRequests.createdAt)],
  });
}

// ── Fetch All Document Requests ──────────────────────────────────────────────

export async function getAllDocumentRequests() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return [];

  return await db.query.documentRequests.findMany({
    orderBy: [desc(documentRequests.createdAt)],
    with: {
      user: {
        with: {
          purok: true,
        },
      },
    },
  });
}

// ── Fetch Pending Requests Count ─────────────────────────────────────────────

export async function getPendingRequestsCount() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return 0;

  const countQuery = await db
    .select({ value: count() })
    .from(documentRequests)
    .where(eq(documentRequests.status, "pending"));

  return countQuery[0]?.value || 0;
}
