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

  const results = await Promise.allSettled([
    getPendingRequestsCount(),
    getPendingReportsCount(),
  ]);

  const pendingRequestsCount =
    results[0].status === "fulfilled"
      ? results[0].value
      : (console.error("Failed to load pending requests count:", results[0].reason), 0);

  const pendingReportsCount =
    results[1].status === "fulfilled"
      ? results[1].value
      : (console.error("Failed to load pending reports count:", results[1].reason), 0);


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

