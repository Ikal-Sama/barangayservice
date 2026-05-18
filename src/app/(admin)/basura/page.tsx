import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTodaySchedules } from "@/lib/actions/waste-tracker";
import { getActivePuroks } from "@/lib/actions/puroks";
import BasuraTrackerClient from "./basura-client";

export const metadata: Metadata = { title: "Basura Tracker" };

export default async function BasuraTrackerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") {
    redirect("/login");
  }

  const [schedules, puroks] = await Promise.all([
    getTodaySchedules(),
    getActivePuroks(),
  ]);

  return (
    <BasuraTrackerClient
      schedules={schedules as Parameters<typeof BasuraTrackerClient>[0]["schedules"]}
      puroks={puroks}
    />
  );
}
