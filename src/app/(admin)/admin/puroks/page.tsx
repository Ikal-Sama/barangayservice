import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllPuroks } from "@/lib/actions/puroks";
import PuroksClient from "./puroks-client";

export const metadata: Metadata = { title: "Manage Puroks" };

export default async function PuroksPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") redirect("/login");

  const puroks = await getAllPuroks();

  return <PuroksClient initialPuroks={puroks} />;
}
