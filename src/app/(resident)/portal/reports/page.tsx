import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { puroks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserIncidentReports } from "@/lib/actions/reports";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ResidentReportsClient } from "./reports-client";

export const metadata: Metadata = { title: "Community Reports" };

export default async function ResidentReportsPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session) {
    redirect("/login");
  }

  const [activePuroks, reports] = await Promise.all([
    db.query.puroks.findMany({
      where: eq(puroks.isActive, true),
      orderBy: (p, { asc }) => [asc(p.name)],
    }),
    getUserIncidentReports(),
  ]);

  return (
    <main className="min-h-screen bg-app-grid pb-safe-bottom text-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 px-4 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link
            href="/portal"
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm transition hover:text-slate-950"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Resident Hub
            </p>
            <h1 className="text-lg font-black text-slate-950">Community Reports</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <ResidentReportsClient 
          initialReports={reports}
          puroks={activePuroks}
          userPurokId={(session.user as any).purokId}
        />
      </div>
    </main>
  );
}
