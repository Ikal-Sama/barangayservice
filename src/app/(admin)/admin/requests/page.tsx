import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllDocumentRequests } from "@/lib/actions/documents";
import { RequestsClient } from "./requests-client";

export const metadata: Metadata = {
  title: "Document Requests | Admin | BarangayLink",
};

export default async function AdminRequestsPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const requests = await getAllDocumentRequests();

  return <RequestsClient requests={requests} />;
}
