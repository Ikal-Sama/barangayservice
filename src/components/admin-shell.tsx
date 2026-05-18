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
  AlertCircle,
} from "lucide-react";
import SignOutButton from "@/components/sign-out-button";
import Logo from "@/components/logo";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/reports", label: "Incident Reports", icon: AlertCircle },
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
  pendingReportsCount = 0,
}: {
  children: React.ReactNode;
  userName: string;
  pendingRequestsCount?: number;
  pendingReportsCount?: number;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-app-grid text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/70 bg-white/80 px-4 py-5 shadow-[18px_0_70px_-45px_rgba(15,23,42,0.65)] backdrop-blur-2xl lg:block">
        <Link href="/admin" className="px-2 block">
          <Logo />
        </Link>

        <nav className="mt-8 space-y-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            const isRequests = href === "/admin/requests";
            const isReports = href === "/admin/reports";
            const showBadge = (isRequests && pendingRequestsCount > 0) || (isReports && pendingReportsCount > 0);
            const badgeCount = isRequests ? pendingRequestsCount : pendingReportsCount;

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
                  <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full px-1 text-[10px] font-black bg-red-500 text-white">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <Link href="/admin/profile" className="flex items-center gap-3 group rounded-xl p-1 hover:bg-slate-50 transition-colors">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-100 text-cyan-700 transition-transform group-hover:scale-105">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950 group-hover:text-cyan-700 transition-colors">{userName}</p>
              <p className="text-xs font-medium text-slate-500">Administrator</p>
            </div>
          </Link>
          <div className="mt-4">
            <SignOutButton variant="full" />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Logo className="h-8 w-8" />
          </Link>
          <SignOutButton />
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            const isRequests = href === "/admin/requests";
            const isReports = href === "/admin/reports";
            const showBadge = (isRequests && pendingRequestsCount > 0) || (isReports && pendingReportsCount > 0);
            const badgeCount = isRequests ? pendingRequestsCount : pendingReportsCount;

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
                    {badgeCount > 99 ? "99+" : badgeCount}
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

