import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin-shell";
import { getPendingRequestsCount } from "@/lib/actions/documents";
import { getPendingReportsCount } from "@/lib/actions/reports";

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch((error) => {
      console.error("Admin session lookup failed:", error);
      return null;
    });

  if (!session || (session.user as { role?: string }).role !== "admin") {
    redirect("/login");
  }

  const [pendingRequestsCount, pendingReportsCount] = await Promise.all([
    getPendingRequestsCount(),
    getPendingReportsCount(),
  ]);

  return (
    <AdminShell 
      userName={session.user.name ?? "Admin"}
      pendingRequestsCount={pendingRequestsCount}
      pendingReportsCount={pendingReportsCount}
    >
      {children}
    </AdminShell>
  );
}

