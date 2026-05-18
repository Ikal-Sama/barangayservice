/**
 * BarangayLink – Database Seed Script
 * Run with: npx tsx src/db/seed.ts
 *
 * Seeds:
 *  - Admin user account
 *  - 6 sample Puroks
 *  - Today's waste schedules for each Purok
 *  - Emergency contacts
 *  - A sample announcement
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { createId } from "@paralleldrive/cuid2";
import { hashPassword } from "better-auth/crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

const PUROK_NAMES = [
  "Purok Sook",
  "Purok Gemilina",
  "Purok Mantalisay",
  "Purok Lomboy",
];

const EMERGENCY_CONTACTS = [
  { name: "Barangay Hotline", number: "0917-123-4567", category: "barangay", sortOrder: 0 },
  { name: "BFP Fire Station", number: "0918-234-5678", category: "fire", sortOrder: 1 },
  { name: "PNP Police Station", number: "0919-345-6789", category: "police", sortOrder: 2 },
  { name: "Rural Health Unit", number: "0920-456-7890", category: "health", sortOrder: 3 },
];

async function seed() {
  console.log("🌱 Starting BarangayLink seed…\n");

  // ── 1. Admin user ─────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "secretary@barangaysanisidro.gov.ph";

  const existingAdmin = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, adminEmail)
  });

  let finalAdminId = existingAdmin?.id;

  if (!existingAdmin) {
    finalAdminId = createId();
    const adminAccountId = createId();
    const hashedPassword = await hashPassword(
      process.env.ADMIN_PASSWORD ?? "Admin@BarangayLink2025!"
    );

    await db.insert(schema.users).values({
      id: finalAdminId,
      name: process.env.ADMIN_NAME ?? "Barangay Secretary",
      email: adminEmail,
      emailVerified: true,
      role: "admin",
    });

    await db.insert(schema.accounts).values({
      id: adminAccountId,
      accountId: finalAdminId,
      providerId: "credential",
      userId: finalAdminId,
      password: hashedPassword,
    });
    console.log("✅ Admin user seeded");
  } else {
    console.log("✅ Admin user already exists (skipped)");
  }

  console.log("✅ Admin user seeded");

  // ── 2. Puroks ─────────────────────────────────────────────────────────────
  const insertedPuroks = await db
    .insert(schema.puroks)
    .values(PUROK_NAMES.map((name) => ({ name })))
    .onConflictDoNothing()
    .returning({ id: schema.puroks.id, name: schema.puroks.name });

  console.log(`✅ ${insertedPuroks.length} Puroks seeded`);

  // ── 3. Today's waste schedules ────────────────────────────────────────────
  const today = new Date();
  today.setHours(7, 0, 0, 0);  // 7:00 AM collection start

  await db.insert(schema.wasteSchedules).values(
    insertedPuroks.map((p) => ({
      purokId: p.id,
      scheduledDate: today,
      status: "scheduled" as const,
    }))
  ).onConflictDoNothing();

  console.log("✅ Waste schedules seeded");

  // ── 4. Emergency contacts ─────────────────────────────────────────────────
  await db.insert(schema.emergencyContacts).values(EMERGENCY_CONTACTS).onConflictDoNothing();
  console.log("✅ Emergency contacts seeded");

  // ── 5. Sample announcement ────────────────────────────────────────────────
  await db.insert(schema.announcements).values({
    title: "Welcome to BarangayLink!",
    body: "This is the official community portal. You can track garbage collection schedules and receive important announcements here.",
    type: "general",
    targetAllPuroks: true,
    authorId: finalAdminId!,
    isActive: true,
  }).onConflictDoNothing();

  console.log("✅ Sample announcement seeded");

  console.log("\n🎉 Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
