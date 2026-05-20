import { sql } from 'drizzle-orm';

export async function up(db: any) {
  await db.run(sql`
    ALTER TABLE users
    ADD COLUMN notify_email boolean NOT NULL DEFAULT true,
    ADD COLUMN notify_sms   boolean NOT NULL DEFAULT true,
    ADD COLUMN notify_push  boolean NOT NULL DEFAULT true;
  `);
}

export async function down(db: any) {
  await db.run(sql`
    ALTER TABLE users
    DROP COLUMN notify_email,
    DROP COLUMN notify_sms,
    DROP COLUMN notify_push;
  `);
}
