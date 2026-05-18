"use server";

import { db } from "@/db";
import { accounts, puroks, users } from "@/db/schema";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validations";
import { auth } from "@/lib/auth";
import { createId } from "@paralleldrive/cuid2";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import arcjet, {
  createRemoteClient,
  detectBot,
  request,
  slidingWindow,
} from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  client: createRemoteClient({
    timeout: 3000,
  }),
  characteristics: ["ip.src"],
  rules: [
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: 60,
      max: 15, // Max 15 auth attempts per 60s per IP
    }),
  ],
});

type AuthActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function canAttemptPasswordSignIn(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { allowed: false };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
    columns: { id: true },
  });

  return { allowed: Boolean(existingUser) };
}

export async function registerResident(
  raw: RegisterInput
): Promise<AuthActionResult<{ id: string }>> {
  // Arcjet Rate Limiting & Bot Protection
  const arcjetRequest = await request();
  const decision = await aj.protect(arcjetRequest);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return {
        success: false,
        error: "Too many registration attempts. Please slow down and try again later.",
      };
    }
    return {
      success: false,
      error: "Automated requests are not allowed.",
    };
  }

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the registration form.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, password, mobileNumber, purokId } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      error: "An account already exists for this email.",
    };
  }

  if (purokId) {
    const activePurok = await db.query.puroks.findFirst({
      where: eq(puroks.id, purokId),
      columns: { id: true, isActive: true },
    });

    if (!activePurok?.isActive) {
      return {
        success: false,
        error: "Please select an active Purok.",
      };
    }
  }

  const userId = createId();
  const accountId = createId();
  const hashedPassword = await hashPassword(password);

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      name,
      email,
      emailVerified: false,
      role: "resident",
      mobileNumber: mobileNumber || null,
      purokId: purokId ?? null,
    });

    await tx.insert(accounts).values({
      id: accountId,
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
    });
  });

  return {
    success: true,
    data: { id: userId },
    message: "Account created. Please sign in.",
  };
}

export async function loginWithPassword(
  raw: LoginInput
): Promise<AuthActionResult<{ role: "admin" | "resident" }>> {
  // Arcjet Rate Limiting & Bot Protection
  const arcjetRequest = await request();
  const decision = await aj.protect(arcjetRequest);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return {
        success: false,
        error: "Too many login attempts. Please slow down and try again later.",
      };
    }
    return {
      success: false,
      error: "Automated requests are not allowed.",
    };
  }

  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid email or password.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  const signInResult = await auth.api
    .signInEmail({
      body: {
        email,
        password,
        rememberMe: true,
      },
      headers: await headers(),
    })
    .catch(() => null);

  if (!signInResult) {
    return { success: false, error: "Invalid email or password." };
  }

  const role = signInResult.user.role === "admin" ? "admin" : "resident";

  return {
    success: true,
    data: { role },
    message: "Welcome back!",
  };
}

export async function logout(): Promise<AuthActionResult> {
  const result = await auth.api
    .signOut({
      headers: await headers(),
    })
    .catch(() => null);

  if (!result?.success) {
    return {
      success: false,
      error: "Unable to sign out. Please try again.",
    };
  }

  return {
    success: true,
    data: undefined,
    message: "Signed out.",
  };
}
