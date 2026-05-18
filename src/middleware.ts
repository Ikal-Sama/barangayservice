import arcjet, { createMiddleware, detectBot, slidingWindow } from "@arcjet/next";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "@/lib/auth";

// ── Arcjet client ─────────────────────────────────────────────────────────────
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    // Block headless browsers and known bad bots on sensitive routes
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
      ],
    }),
    // Sliding-window rate limit: 60 requests / 60 seconds per IP
    slidingWindow({
      mode: "LIVE",
      interval: 60,
      max: 60,
    }),
  ],
});

// ── Route protection config ───────────────────────────────────────────────────
const ADMIN_ROUTES = ["/admin", "/basura"];
const AUTH_ROUTES  = ["/login", "/register"];
const PUBLIC_PATHS = ["/", "/api/auth", "/login", "/register"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );
}

// ── Middleware ────────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Run Arcjet on all /api routes and server-action-adjacent paths
  if (pathname.startsWith("/api") || pathname.startsWith("/basura") || pathname.startsWith("/admin")) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { error: "Too many requests. Please slow down." },
          { status: 429 }
        );
      }
      if (decision.reason.isBot()) {
        return NextResponse.json(
          { error: "Automated requests are not allowed." },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
  }

  // 2. Session guard
  if (!isPublic(pathname)) {
    // Fetch session via API to avoid edge runtime node module errors
    const response = await fetch(new URL("/api/auth/get-session", request.url), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    const session = response.ok ? await response.json().catch(() => null) : null;

    // Not logged in → redirect to login
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin-only routes
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
      if (session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/portal", request.url));
      }
    }

  }

  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const response = await fetch(new URL("/api/auth/get-session", request.url), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    const session = response.ok ? await response.json().catch(() => null) : null;

    if (session) {
      const dest = session.user.role === "admin" ? "/admin" : "/portal";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
