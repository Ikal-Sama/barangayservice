import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllIncidentReports } from "@/lib/actions/reports";
import { AdminReportsClient } from "./reports-client";

export const metadata: Metadata = { title: "Admin Community Reports" };

export default async function AdminReportsPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  const reports = await getAllIncidentReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Incident Reports</h1>
        <p className="text-sm font-medium text-slate-500">
          Monitor and resolve community feedback, utility complaints, and safety reports.
        </p>
      </div>

      <AdminReportsClient initialReports={reports} />
    </div>
  );
}
