import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

async function reset() {
  console.log("⚠️  Wiping all database tables...");
  
  // Truncate all tables and CASCADE to handle foreign key dependencies
  await db.execute(sql`
    TRUNCATE TABLE 
      users, 
      sessions, 
      accounts, 
      puroks, 
      announcements,
      announcement_puroks,
      announcement_reads,
      waste_schedules, 
      emergency_contacts, 
      verifications 
    CASCADE;
  `);

  console.log("✅ Database reset complete!");
  await pool.end();
}

reset().catch((err) => {
  console.error("❌ Reset failed:", err);
  process.exit(1);
});
