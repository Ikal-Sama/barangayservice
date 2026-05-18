import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  mobileNumber: z
    .string()
    .regex(/^09\d{9}$/, "Mobile number must be in format 09XXXXXXXXX")
    .optional()
    .or(z.literal("")),
  purokId: z
    .string()
    .uuid("Please select a valid Purok")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  mobileNumber: z
    .string()
    .regex(/^09\d{9}$/, "Mobile number must be in format 09XXXXXXXXX")
    .optional()
    .or(z.literal("")),
  purokId: z
    .string()
    .uuid("Please select a valid Purok")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ── Puroks ────────────────────────────────────────────────────────────────────

export const purokSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  isActive: z.boolean(),
});
export type PurokInput = z.infer<typeof purokSchema>;

// ── Announcements ─────────────────────────────────────────────────────────────

export const announcementSchema = z.object({
  title: z.string().trim().min(4, "Title must be at least 4 characters").max(200),
  body: z.string().trim().min(10, "Message body must be at least 10 characters").max(2000),
  type: z.enum(["emergency", "waste_management", "health_clinic", "general", "events"]),
  targetAllPuroks: z.boolean().default(true),
  purokIds: z.array(z.string().uuid()).optional(),
  expiresAt: z.string().datetime({ offset: true }).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});
export type AnnouncementInput = z.infer<typeof announcementSchema>;

// ── Waste Tracker ─────────────────────────────────────────────────────────────

export const wasteStatusUpdateSchema = z.object({
  scheduleId: z.string().uuid("Invalid schedule ID"),
  status: z.enum(["scheduled", "en_route", "collecting", "completed"]),
  notes: z.string().max(300).optional().or(z.literal("")),
});
export type WasteStatusUpdateInput = z.infer<typeof wasteStatusUpdateSchema>;

export const wasteScheduleCreateSchema = z.object({
  purokId: z.string().uuid("Please select a Purok"),
  scheduledDate: z.string().min(1, "Please select a date"),
  notes: z.string().max(300).optional().or(z.literal("")),
});
export type WasteScheduleCreateInput = z.infer<typeof wasteScheduleCreateSchema>;

// ── Emergency Contacts ────────────────────────────────────────────────────────

export const emergencyContactSchema = z.object({
  name: z.string().min(2).max(100),
  number: z.string().min(7).max(20),
  category: z.enum(["barangay", "fire", "police", "health"]),
  iconName: z.string().max(50).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;

// ── Document Requests ─────────────────────────────────────────────────────────

export const documentRequestSchema = z.object({
  type: z.enum([
    "barangay_clearance",
    "certificate_of_indigency",
    "business_clearance",
    "green_card",
    "other",
  ]),
  purpose: z.string().min(5, "Purpose must be at least 5 characters").max(500),
});
export type DocumentRequestInput = z.infer<typeof documentRequestSchema>;

export const updateDocumentRequestStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "pending",
    "processing",
    "ready_for_pickup",
    "completed",
    "rejected",
  ]),
  adminNotes: z.string().max(500).optional().or(z.literal("")),
});
export type UpdateDocumentRequestStatusInput = z.infer<typeof updateDocumentRequestStatusSchema>;

// ── Incident Reports ──────────────────────────────────────────────────────────

export const incidentReportSchema = z.object({
  title: z.string().trim().min(4, "Title must be at least 4 characters").max(100),
  category: z.enum(["waste", "infrastructure", "noise", "safety", "health", "other"]),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(1000),
  purokId: z
    .string()
    .uuid("Please select a valid Purok")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});
export type IncidentReportInput = z.infer<typeof incidentReportSchema>;

export const updateIncidentReportStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "investigating", "resolved", "closed"]),
  adminNotes: z.string().max(500).optional().or(z.literal("")),
});
export type UpdateIncidentReportStatusInput = z.infer<typeof updateIncidentReportStatusSchema>;


