import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminProfileClient from "./profile-client";
import { UserCog } from "lucide-react";

export const metadata: Metadata = { title: "Admin Profile | BarangayLink" };

export default async function AdminProfilePage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="space-y-8">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-100 text-indigo-700">
              <UserCog className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Admin Profile
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Manage your personal information and security settings.
          </p>
        </div>
      </div>

      <AdminProfileClient 
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
        }} 
      />
    </div>
  );
}
