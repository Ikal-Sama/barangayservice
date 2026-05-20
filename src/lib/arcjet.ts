import arcjet, {
  createRemoteClient,
  detectBot,
  request as arcjetNextRequest,
  shield,
  slidingWindow,
  type ArcjetNextRequest,
} from "@arcjet/next";
import { NextResponse } from "next/server";

const remoteClient = createRemoteClient({ timeout: 3000 });

function arcjetKey(): string | undefined {
  const key = process.env.ARCJET_KEY?.trim();
  return key || undefined;
}

export function isArcjetConfigured(): boolean {
  return Boolean(arcjetKey());
}

const authBaseRules = [
  shield({ mode: "LIVE" }),
  detectBot({
    mode: "LIVE",
    allow: ["CATEGORY:SEARCH_ENGINE"],
  }),
  slidingWindow({
    mode: "LIVE",
    interval: 60,
    max: 15,
  }),
] as const;

/** Auth by IP (password change and other auth POSTs without email in body) */
const authIpAj = arcjet({
  key: arcjetKey() ?? "ajkey_development",
  client: remoteClient,
  characteristics: ["ip.src"],
  rules: [...authBaseRules],
});

/** Auth by IP + email (login, register, sign-in/sign-up API) */
const authEmailAj = arcjet({
  key: arcjetKey() ?? "ajkey_development",
  client: remoteClient,
  characteristics: ["ip.src", "email"],
  rules: [
    ...authBaseRules,
    slidingWindow({
      mode: "LIVE",
      characteristics: ["email"],
      interval: 60,
      max: 5,
    }),
  ],
});

/** Authenticated form submissions (documents, reports) */
export const formAj = arcjet({
  key: arcjetKey() ?? "ajkey_development",
  client: remoteClient,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    slidingWindow({
      mode: "LIVE",
      interval: 60,
      max: 10,
    }),
  ],
});

const AUTH_POST_PATHS = new Set([
  "/sign-in/email",
  "/sign-up/email",
  "/change-password",
  "/forget-password",
  "/reset-password",
]);

function authSubPath(pathname: string): string {
  const prefix = "/api/auth";
  if (!pathname.startsWith(prefix)) return "";
  const rest = pathname.slice(prefix.length);
  return rest.startsWith("/") ? rest : `/${rest}`;
}

export function isProtectedAuthPostPath(pathname: string): boolean {
  return AUTH_POST_PATHS.has(authSubPath(pathname));
}

async function readEmailFromJsonBody(req: Request): Promise<string | undefined> {
  try {
    const body: unknown = await req.clone().json();
    if (
      body &&
      typeof body === "object" &&
      "email" in body &&
      typeof (body as { email: unknown }).email === "string"
    ) {
      const email = (body as { email: string }).email.trim().toLowerCase();
      return email || undefined;
    }
  } catch {
    // Body may be empty or non-JSON; skip email characteristic
  }
  return undefined;
}

type ArcjetDenial = {
  success: false;
  error: string;
};

function denialFromDecision(decision: {
  isDenied: () => boolean;
  reason: {
    isRateLimit: () => boolean;
    isBot: () => boolean;
  };
}): ArcjetDenial | null {
  if (!decision.isDenied()) return null;

  if (decision.reason.isRateLimit()) {
    return {
      success: false,
      error: "Too many requests. Please slow down and try again later.",
    };
  }

  if (decision.reason.isBot()) {
    return {
      success: false,
      error: "Automated requests are not allowed.",
    };
  }

  return {
    success: false,
    error: "Request blocked for security reasons.",
  };
}

async function runProtect(
  req: ArcjetNextRequest,
  options?: { email?: string; form?: boolean }
): Promise<ArcjetDenial | null> {
  if (!isArcjetConfigured()) return null;

  try {
    const decision = options?.form
      ? await formAj.protect(req)
      : options?.email
        ? await authEmailAj.protect(req, { email: options.email })
        : await authIpAj.protect(req);

    if (decision.isErrored()) {
      console.warn("Arcjet error:", decision.reason.message);
      return null;
    }

    return denialFromDecision(decision);
  } catch (error) {
    console.warn("Arcjet protection error:", error);
    return null;
  }
}

/** Server actions: returns a denial object or null to continue */
export async function protectAuthAction(options?: {
  email?: string;
}): Promise<ArcjetDenial | null> {
  const req = await arcjetNextRequest();
  return runProtect(req, options);
}

export async function protectFormAction(): Promise<ArcjetDenial | null> {
  const req = await arcjetNextRequest();
  return runProtect(req, { form: true });
}

/** Better Auth API route: returns a Response to short-circuit, or null to continue */
export async function protectAuthApiPost(
  req: Request
): Promise<Response | null> {
  if (!isProtectedAuthPostPath(new URL(req.url).pathname)) {
    return null;
  }

  if (!isArcjetConfigured()) return null;

  const email = await readEmailFromJsonBody(req);
  const denial = await runProtect(req, email ? { email } : undefined);

  if (!denial) return null;

  const status = denial.error.includes("slow down") ? 429 : 403;
  return NextResponse.json(
    {
      error: denial.error,
      message: denial.error,
    },
    { status }
  );
}
