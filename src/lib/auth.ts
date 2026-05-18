import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  // ── Email + Password credentials ──────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Off for low-friction resident onboarding
    minPasswordLength: 8,
  },

  // ── Session settings ──────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7,       // 7 days
    updateAge: 60 * 60 * 24,            // refresh daily
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,                   // cache for 5 min
    },
  },

  // ── User fields ───────────────────────────────────────
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "resident",
        input: false,                   // only settable server-side
      },
      mobileNumber: {
        type: "string",
        required: false,
      },
      purokId: {
        type: "string",
        required: false,
      },
    },
  },

  // ── Trusted origins ───────────────────────────────────
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
