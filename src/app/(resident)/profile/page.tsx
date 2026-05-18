import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { puroks } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProfileForm from "./profile-form";
import { MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SignOutButton from "@/components/sign-out-button";

export const metadata: Metadata = { title: "My Profile" };

export default async function ResidentProfilePage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  if (!session) redirect("/login");

  const user = session.user as typeof session.user & { purokId?: string; mobileNumber?: string };

  const allPuroks = await db.select().from(puroks).where(eq(puroks.isActive, true));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-safe-bottom">
      {/* ── Top Bar ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="w-10 h-10 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg flex items-center justify-center tap-highlight-none">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">
                {process.env.NEXT_PUBLIC_BARANGAY_NAME ?? "Barangay San Isidro"}
              </p>
              <h1 className="text-base font-semibold tracking-tight text-slate-900 leading-none">
                My Profile
              </h1>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 pt-8 pb-10">
        <div className="glass-card p-6 md:p-8">
          <ProfileForm user={user} puroks={allPuroks} />
        </div>
      </div>
    </main>
  );
}
