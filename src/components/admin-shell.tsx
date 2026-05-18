"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  MapPin,
  Phone,
  Sparkles,
  Truck,
  Users,
  FileText,
} from "lucide-react";
import SignOutButton from "@/components/sign-out-button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/puroks", label: "Puroks", icon: MapPin },
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
  { href: "/basura", label: "Basura Tracker", icon: Truck },
  { href: "/admin/contacts", label: "Emergency Lines", icon: Phone },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminShell({
  children,
  userName,
  pendingRequestsCount = 0,
}: {
  children: React.ReactNode;
  userName: string;
  pendingRequestsCount?: number;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-app-grid text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/70 bg-white/80 px-4 py-5 shadow-[18px_0_70px_-45px_rgba(15,23,42,0.65)] backdrop-blur-2xl lg:block">
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight">BarangayLink</p>
            <p className="text-xs font-medium text-slate-500">Command Center</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            const isRequests = href === "/admin/requests";
            const showBadge = isRequests && pendingRequestsCount > 0;
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </div>
                {showBadge && (
                  <span className={`grid h-5 min-w-[1.25rem] place-items-center rounded-full px-1 text-[10px] font-black ${
                    active ? "bg-red-500 text-white" : "bg-red-500 text-white"
                  }`}>
                    {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-100 text-cyan-700">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">{userName}</p>
              <p className="text-xs font-medium text-slate-500">Administrator</p>
            </div>
          </div>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-950 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-black">BarangayLink</span>
          </Link>
          <SignOutButton />
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            const isRequests = href === "/admin/requests";
            const showBadge = isRequests && pendingRequestsCount > 0;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                  active ? "bg-slate-950 text-white" : "bg-white text-slate-600"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {showBadge && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white shadow-sm ring-2 ring-white">
                    {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="lg:pl-72">
        <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
