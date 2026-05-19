/**
 * BarangayLink – Drizzle ORM Schema (PostgreSQL)
 * -----------------------------------------------
 * Tables: users, sessions, accounts, puroks,
 *         announcements, announcement_puroks,
 *         waste_schedules, emergency_contacts
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  integer,
  uuid,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["admin", "resident"]);

export const announcementTypeEnum = pgEnum("announcement_type", [
  "emergency",
  "waste_management",
  "health_clinic",
  "general",
  "events",
]);

export const wasteStatusEnum = pgEnum("waste_status", [
  "scheduled",
  "en_route",
  "collecting",
  "completed",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "barangay_clearance",
  "certificate_of_indigency",
  "business_clearance",
  "green_card",
  "other",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "processing",
  "ready_for_pickup",
  "completed",
  "rejected",
]);

export const reportCategoryEnum = pgEnum("report_category", [
  "waste",
  "infrastructure",
  "noise",
  "safety",
  "health",
  "other",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "investigating",
  "resolved",
  "closed",
]);

// ─────────────────────────────────────────────
// PUROKS  (neighborhood clusters)
// ─────────────────────────────────────────────

export const puroks = pgTable(
  "puroks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),          // e.g. "Purok 1 – Sampaguita"
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("puroks_name_idx").on(t.name)]
);

// ─────────────────────────────────────────────
// USERS  (Better-Auth compatible)
// ─────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),                    // Better-Auth uses text UUIDs
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: userRoleEnum("role").notNull().default("resident"),
    mobileNumber: text("mobile_number"),
    purokId: uuid("purok_id").references(() => puroks.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("users_email_idx").on(t.email),
    index("users_purok_idx").on(t.purokId),
  ]
);

// ─────────────────────────────────────────────
// SESSIONS  (Better-Auth)
// ─────────────────────────────────────────────

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_token_idx").on(t.token)]
);

// ─────────────────────────────────────────────
// ACCOUNTS  (Better-Auth OAuth / credential providers)
// ─────────────────────────────────────────────

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),                    // bcrypt hash for credentials
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("accounts_user_idx").on(t.userId),
    index("accounts_provider_idx").on(t.providerId, t.accountId),
  ]
);

// ─────────────────────────────────────────────
// VERIFICATIONS  (Better-Auth email/OTP tokens)
// ─────────────────────────────────────────────

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─────────────────────────────────────────────
// ANNOUNCEMENTS
// ─────────────────────────────────────────────

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    type: announcementTypeEnum("type").notNull().default("general"),
    isActive: boolean("is_active").notNull().default(true),
    /** If null → broadcast to ALL puroks */
    targetAllPuroks: boolean("target_all_puroks").notNull().default(true),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("announcements_type_idx").on(t.type),
    index("announcements_active_idx").on(t.isActive),
    index("announcements_created_idx").on(t.createdAt),
  ]
);

// ─────────────────────────────────────────────
// ANNOUNCEMENT ↔ PUROK  (many-to-many)
// ─────────────────────────────────────────────

export const announcementPuroks = pgTable(
  "announcement_puroks",
  {
    announcementId: uuid("announcement_id")
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    purokId: uuid("purok_id")
      .notNull()
      .references(() => puroks.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.announcementId, t.purokId] })]
);

// ─────────────────────────────────────────────
// ANNOUNCEMENT READS  (per-resident read tracking)
// ─────────────────────────────────────────────

export const announcementReads = pgTable(
  "announcement_reads",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    announcementId: uuid("announcement_id")
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.announcementId] }),
    index("announcement_reads_user_idx").on(t.userId),
  ]
);

// ─────────────────────────────────────────────
// WASTE SCHEDULES  (per-purok collection status)
// ─────────────────────────────────────────────

export const wasteSchedules = pgTable(
  "waste_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    purokId: uuid("purok_id")
      .notNull()
      .references(() => puroks.id, { onDelete: "cascade" }),
    status: wasteStatusEnum("status").notNull().default("scheduled"),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }).notNull(),
    /** When truck physically arrived / started collecting */
    arrivedAt: timestamp("arrived_at", { withTimezone: true }),
    /** When collection was marked complete */
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedById: text("updated_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("waste_purok_date_idx").on(t.purokId, t.scheduledDate),
    index("waste_status_idx").on(t.status),
  ]
);

// ─────────────────────────────────────────────
// EMERGENCY CONTACTS
// ─────────────────────────────────────────────

export const emergencyContacts = pgTable(
  "emergency_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),               // e.g. "Barangay Hotline"
    number: text("number").notNull(),
    category: text("category").notNull(),       // "barangay" | "fire" | "police" | "health"
    iconName: text("icon_name"),                // lucide icon name for UI
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("emergency_category_idx").on(t.category)]
);

// ─────────────────────────────────────────────
// DOCUMENT REQUESTS
// ─────────────────────────────────────────────

export const documentRequests = pgTable(
  "document_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: documentTypeEnum("type").notNull(),
    purpose: text("purpose").notNull(),
    status: requestStatusEnum("status").notNull().default("pending"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("document_requests_user_idx").on(t.userId),
    index("document_requests_status_idx").on(t.status),
  ]
);

// ─────────────────────────────────────────────
// INCIDENT REPORTS
// ─────────────────────────────────────────────

export const incidentReports = pgTable(
  "incident_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    purokId: uuid("purok_id")
      .references(() => puroks.id, { onDelete: "set null" }),
    category: reportCategoryEnum("category").notNull().default("other"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: reportStatusEnum("status").notNull().default("pending"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("incident_reports_user_idx").on(t.userId),
    index("incident_reports_purok_idx").on(t.purokId),
    index("incident_reports_status_idx").on(t.status),
    index("incident_reports_created_idx").on(t.createdAt),
  ]
);

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const puroksRelations = relations(puroks, ({ many }) => ({
  users: many(users),
  wasteSchedules: many(wasteSchedules),
  announcementPuroks: many(announcementPuroks),
  incidentReports: many(incidentReports),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  purok: one(puroks, { fields: [users.purokId], references: [puroks.id] }),
  sessions: many(sessions),
  accounts: many(accounts),
  announcements: many(announcements),
  documentRequests: many(documentRequests),
  incidentReports: many(incidentReports),
  announcementReads: many(announcementReads),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const announcementsRelations = relations(
  announcements,
  ({ one, many }) => ({
    author: one(users, {
      fields: [announcements.authorId],
      references: [users.id],
    }),
    announcementPuroks: many(announcementPuroks),
    announcementReads: many(announcementReads),
  })
);

export const announcementReadsRelations = relations(
  announcementReads,
  ({ one }) => ({
    user: one(users, {
      fields: [announcementReads.userId],
      references: [users.id],
    }),
    announcement: one(announcements, {
      fields: [announcementReads.announcementId],
      references: [announcements.id],
    }),
  })
);

export const announcementPuroksRelations = relations(
  announcementPuroks,
  ({ one }) => ({
    announcement: one(announcements, {
      fields: [announcementPuroks.announcementId],
      references: [announcements.id],
    }),
    purok: one(puroks, {
      fields: [announcementPuroks.purokId],
      references: [puroks.id],
    }),
  })
);

export const wasteSchedulesRelations = relations(
  wasteSchedules,
  ({ one }) => ({
    purok: one(puroks, {
      fields: [wasteSchedules.purokId],
      references: [puroks.id],
    }),
    updatedBy: one(users, {
      fields: [wasteSchedules.updatedById],
      references: [users.id],
    }),
  })
);

export const documentRequestsRelations = relations(
  documentRequests,
  ({ one }) => ({
    user: one(users, {
      fields: [documentRequests.userId],
      references: [users.id],
    }),
  })
);

export const incidentReportsRelations = relations(
  incidentReports,
  ({ one }) => ({
    user: one(users, {
      fields: [incidentReports.userId],
      references: [users.id],
    }),
    purok: one(puroks, {
      fields: [incidentReports.purokId],
      references: [puroks.id],
    }),
  })
);

// ─────────────────────────────────────────────
// TYPE EXPORTS  (inferred from schema)
// ─────────────────────────────────────────────

export type Purok = typeof puroks.$inferSelect;
export type NewPurok = typeof puroks.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

export type AnnouncementRead = typeof announcementReads.$inferSelect;
export type NewAnnouncementRead = typeof announcementReads.$inferInsert;

export type WasteSchedule = typeof wasteSchedules.$inferSelect;
export type NewWasteSchedule = typeof wasteSchedules.$inferInsert;

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type NewEmergencyContact = typeof emergencyContacts.$inferInsert;

export type DocumentRequest = typeof documentRequests.$inferSelect;
export type NewDocumentRequest = typeof documentRequests.$inferInsert;

export type IncidentReport = typeof incidentReports.$inferSelect;
export type NewIncidentReport = typeof incidentReports.$inferInsert;

