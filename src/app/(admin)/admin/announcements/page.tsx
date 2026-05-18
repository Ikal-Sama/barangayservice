import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getActivePuroks } from "@/lib/actions/puroks";
import AnnouncementsClient from "./announcements-client";
import type { Announcement } from "@/db/schema";

export const metadata: Metadata = { title: "Manage Announcements" };

export default async function AnnouncementsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") redirect("/login");

  const [allAnnouncements, puroks] = await Promise.all([
    db.query.announcements.findMany({
      where: eq(announcements.isActive, true),
      with: { author: { columns: { name: true } } },
      orderBy: (a, { desc }) => [desc(a.createdAt)],
    }),
    getActivePuroks(),
  ]);

  return (
    <AnnouncementsClient
      initialAnnouncements={allAnnouncements as Parameters<typeof AnnouncementsClient>[0]["initialAnnouncements"]}
      puroks={puroks}
    />
  );
}
