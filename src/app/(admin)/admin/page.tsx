import type { Metadata } from "next";
import { db } from "@/db";
import {
  announcements,
  emergencyContacts,
  puroks,
  users,
  wasteSchedules,
} from "@/db/schema";
import { and, count, eq, gte, lte } from "drizzle-orm";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  CalendarClock,
  MapPin,
  Phone,
  Plus,
  Radio,
  Truck,
  Users,
} from "lucide-react";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getDashboardStats() {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const [
    [purokCount],
    [residentCount],
    [announcementCount],
    [contactCount],
    todaySchedules,
    latestAnnouncements,
  ] = await Promise.all([
    db.select({ count: count() }).from(puroks).where(eq(puroks.isActive, true)),
    db.select({ count: count() }).from(users).where(eq(users.role, "resident")),
    db
      .select({ count: count() })
      .from(announcements)
      .where(eq(announcements.isActive, true)),
    db
      .select({ count: count() })
      .from(emergencyContacts)
      .where(eq(emergencyContacts.isActive, true)),
    db.query.wasteSchedules.findMany({
      where: and(
        gte(wasteSchedules.scheduledDate, start),
        lte(wasteSchedules.scheduledDate, end)
      ),
      with: { purok: true },
      orderBy: (ws, { asc }) => [asc(ws.scheduledDate)],
    }),
    db.query.announcements.findMany({
      where: eq(announcements.isActive, true),
      with: { author: { columns: { name: true } } },
      orderBy: (a, { desc }) => [desc(a.createdAt)],
      limit: 4,
    }),
  ]);

  return {
    purokCount: purokCount.count,
    residentCount: residentCount.count,
    announcementCount: announcementCount.count,
    contactCount: contactCount.count,
    todaySchedules,
    latestAnnouncements,
  };
}

const statCards = [
  {
    key: "residentCount",
    label: "Residents",
    icon: Users,
    tone: "bg-cyan-100 text-cyan-700",
  },
  {
    key: "purokCount",
    label: "Active Puroks",
    icon: MapPin,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "announcementCount",
    label: "Live Alerts",
    icon: Bell,
    tone: "bg-violet-100 text-violet-700",
  },
  {
    key: "contactCount",
    label: "Emergency Lines",
    icon: Phone,
    tone: "bg-rose-100 text-rose-700",
  },
] as const;

const quickActions = [
  {
    href: "/admin/announcements",
    label: "Publish announcement",
    desc: "Post advisories, clinic schedules, and emergency alerts.",
    icon: Bell,
  },
  {
    href: "/basura",
    label: "Update collection route",
    desc: "Move garbage collection from scheduled to complete.",
    icon: Truck,
  },
  {
    href: "/admin/puroks",
    label: "Manage puroks",
    desc: "Create or edit resident neighborhood clusters.",
    icon: MapPin,
  },
  {
    href: "/admin/contacts",
    label: "Maintain hotlines",
    desc: "Keep emergency numbers current for residents.",
    icon: Phone,
  },
] as const;

function statusTone(status: string) {
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "collecting") return "bg-cyan-100 text-cyan-700";
  if (status === "en_route") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const completionCount = stats.todaySchedules.filter(
    (item) => item.status === "completed"
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 text-white shadow-[0_30px_90px_-50px_rgba(15,23,42,0.9)]">
        <div className="grid gap-6 p-6 md:grid-cols-[1.35fr_0.65fr] md:p-8">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
              <Radio className="h-3.5 w-3.5" />
              Live barangay operations
            </div>
            <h1 className="max-w-2xl text-3xl font-black tracking-tight text-balance sm:text-5xl">
              Barangay command center for today&apos;s services.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Monitor collection progress, send resident alerts, and keep
              emergency resources organized from one admin workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/admin/announcements"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-50"
              >
                <Plus className="h-4 w-4" />
                New announcement
              </Link>
              <Link
                href="/basura"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Open tracker
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-200">Today&apos;s collection</p>
              <CalendarClock className="h-5 w-5 text-cyan-200" />
            </div>
            <p className="mt-7 text-5xl font-black tracking-tight">
              {completionCount}
              <span className="text-xl text-slate-400">
                /{stats.todaySchedules.length}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-300">routes completed</p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{
                  width: `${
                    stats.todaySchedules.length
                      ? (completionCount / stats.todaySchedules.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, tone }) => (
          <div key={key} className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                Active
              </span>
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight text-slate-950">
              {stats[key]}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <div className="glass-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-950">
                Quick Actions
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Common admin tasks for daily barangay operations.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {quickActions.map(({ href, label, desc, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-3xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-950" />
                </div>
                <p className="text-sm font-black text-slate-950">{label}</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-slate-950">
                Collection Status
              </h2>
              <Truck className="h-5 w-5 text-slate-400" />
            </div>
            {stats.todaySchedules.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm font-medium text-slate-500">
                No schedules for today.
              </div>
            ) : (
              <div className="space-y-2">
                {stats.todaySchedules.map((ws) => (
                  <div
                    key={ws.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3"
                  >
                    <p className="truncate text-sm font-bold text-slate-800">
                      {ws.purok?.name}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${statusTone(
                        ws.status
                      )}`}
                    >
                      {ws.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-slate-950">
                Latest Alerts
              </h2>
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {stats.latestAnnouncements.length === 0 ? (
                <p className="text-sm font-medium text-slate-500">
                  No active announcements yet.
                </p>
              ) : (
                stats.latestAnnouncements.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-white p-4">
                    <p className="text-sm font-black text-slate-950">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {item.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
