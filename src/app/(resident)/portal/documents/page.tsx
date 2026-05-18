import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserDocumentRequests } from "@/lib/actions/documents";
import { DocumentRequestClient } from "./document-request-client";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Document Requests | BarangayLink",
};

export default async function ResidentDocumentsPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) redirect("/login");

  const requests = await getUserDocumentRequests();

  return (
    <main className="min-h-screen bg-app-grid pb-safe-bottom text-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 px-4 py-4 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <Link
            href="/portal"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm transition hover:text-slate-950"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-black tracking-tight">Document Requests</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DocumentRequestClient requests={requests} />
      </div>
    </main>
  );
}
