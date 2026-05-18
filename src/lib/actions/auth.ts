"use server";

import { db } from "@/db";
import { accounts, puroks, sessions, users } from "@/db/schema";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validations";
import { createId } from "@paralleldrive/cuid2";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { createHmac, randomBytes } from "node:crypto";

type AuthActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const SESSION_COOKIE_NAME = "better-auth.session_token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getAuthSecret() {
  return (
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "better-auth-secret-12345678901234567890"
  );
}

function signCookieValue(value: string) {
  const signature = createHmac("sha256", getAuthSecret())
    .update(value)
    .digest("base64");

  return `${value}.${signature}`;
}

function getSignedCookiePayload(value: string | undefined) {
  if (!value) return null;

  const decoded = decodeURIComponent(value);
  const signatureStart = decoded.lastIndexOf(".");
  if (signatureStart < 1) return null;

  return decoded.substring(0, signatureStart);
}

function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

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

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      accounts: true,
    },
  });

  const credentialAccount = user?.accounts.find(
    (account) => account.providerId === "credential"
  );

  if (!user || !credentialAccount?.password) {
    return { success: false, error: "Invalid email or password." };
  }

  const isValidPassword = await verifyPassword({
    hash: credentialAccount.password,
    password,
  });

  if (!isValidPassword) {
    return { success: false, error: "Invalid email or password." };
  }

  const requestHeaders = await headers();
  const token = createSessionToken();
  const now = new Date();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.insert(sessions).values({
    id: createId(),
    token,
    userId: user.id,
    expiresAt,
    ipAddress:
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: requestHeaders.get("user-agent"),
    createdAt: now,
    updatedAt: now,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signCookieValue(token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires: expiresAt,
  });

  return {
    success: true,
    data: { role: user.role },
    message: "Welcome back!",
  };
}

export async function logout(): Promise<AuthActionResult> {
  const cookieStore = await cookies();
  const token = getSignedCookiePayload(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  cookieStore.delete(SESSION_COOKIE_NAME);

  return {
    success: true,
    data: undefined,
    message: "Signed out.",
  };
}
