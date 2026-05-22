import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getAnnouncementsForPurok,
  getReadAnnouncementIdsForUser,
} from "@/lib/actions/announcements";
import {
  getActiveEmergencyContactsCached,
  getResidentScheduleCached,
} from "@/lib/cached-queries";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  ChevronRight,
  CircleCheck,
  Clock,
  FileText,
  MapPin,
  PackageCheck,
  Phone,
  Radio,
  Settings,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  ANNOUNCEMENT_TYPE_META,
  WASTE_STATUS_META,
  formatRelative,
} from "@/lib/utils";
import type { AnnouncementType, WasteStatus } from "@/lib/utils";
import { NotificationBell } from "./notification-bell";
import { AnnouncementsList } from "./announcements-list";
import SignOutButton from "@/components/sign-out-button";
export const metadata: Metadata = { title: "My Portal" };

async function getPortalData(purokId: string | null | undefined) {
  const dateKey = new Date().toISOString().slice(0, 10);

  const [schedule, announcements, contacts] = await Promise.all([
    purokId
      ? getResidentScheduleCached(purokId, dateKey)
      : Promise.resolve(null),
    purokId ? getAnnouncementsForPurok(purokId) : Promise.resolve([]),
    getActiveEmergencyContactsCached(),
  ]);

  return { schedule, announcements, contacts };
}

const StatusIcons: Record<WasteStatus, React.ElementType> = {
  scheduled: Clock,
  en_route: Truck,
  collecting: PackageCheck,
  completed: CircleCheck,
};

const statusAccent: Record<WasteStatus, string> = {
  scheduled: "bg-slate-400",
  en_route: "bg-amber-400",
  collecting: "bg-cyan-400",
  completed: "bg-emerald-400",
};

const statusText: Record<WasteStatus, string> = {
  scheduled: "text-slate-300",
  en_route: "text-amber-200",
  collecting: "text-cyan-200",
  completed: "text-emerald-200",
};

function contactTone(category: string) {
  if (category === "fire") return "bg-amber-100 text-amber-700";
  if (category === "police") return "bg-cyan-100 text-cyan-700";
  if (category === "health") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

export default async function ResidentPortalPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  if (!session) redirect("/login");

  const user = session.user as typeof session.user & {
    purokId?: string;
    role?: string;
  };
  const [{ schedule, announcements, contacts }, readAnnouncementIds] =
    await Promise.all([
      getPortalData(user.purokId),
      getReadAnnouncementIdsForUser(session.user.id),
    ]);

  const barangayName =
    process.env.NEXT_PUBLIC_BARANGAY_NAME ?? "Barangay San Isidro";
  const status = (schedule?.status ?? "scheduled") as WasteStatus;
  const statusMeta = WASTE_STATUS_META[status];
  const StatusIcon = StatusIcons[status];

  return (
    <main className="min-h-screen bg-app-grid pb-safe-bottom text-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 px-4 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex min-w-0 items-center gap-3 rounded-2xl pr-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {barangayName}
              </p>
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-black text-slate-950">
                  {user.name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell
              initialAnnouncements={announcements}
              initialReadIds={readAnnouncementIds}
              purokId={user.purokId}
            />

            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 text-white shadow-[0_30px_90px_-50px_rgba(15,23,42,0.9)]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
                <Radio className="h-3.5 w-3.5" />
                Resident live portal
              </div>
              <h1 className="max-w-2xl text-3xl font-black tracking-tight text-balance sm:text-5xl">
                Your barangay services, live for today.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Track collection updates, read active advisories, and call key
                emergency lines from one clean resident dashboard.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Garbage collection
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-tight">
                    {schedule?.purok?.name ?? "No purok selected"}
                  </h2>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-slate-950">
                  <StatusIcon className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${statusAccent[status]} ${
                    status === "en_route" ? "animate-pulse" : ""
                  }`}
                />
                <p className={`text-3xl font-black tracking-tight ${statusText[status]}`}>
                  {statusMeta.label}
                </p>
              </div>

              {schedule?.notes ? (
                <p className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm leading-6 text-slate-200">
                  {schedule.notes}
                </p>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {user.purokId
                    ? "No extra notes from the barangay team."
                    : "Set your purok in your profile to receive route-specific updates."}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Link href="/portal/documents" className="glass-card p-6 flex items-center justify-between group transition hover:shadow-xl hover:shadow-slate-200/50">
            <div>
              <h2 className="text-xl font-black tracking-tight">Document Requests</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Request clearance, certificates, and more.</p>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <FileText className="h-6 w-6" />
            </div>
          </Link>
          <Link href="/portal/reports" className="glass-card p-6 flex items-center justify-between group transition hover:shadow-xl hover:shadow-slate-200/50">
            <div>
              <h2 className="text-xl font-black tracking-tight">Community Reports</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Report neighborhood issues or file general feedback.</p>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-500 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </Link>
          <Link href="/profile" className="glass-card p-6 flex items-center justify-between group transition hover:shadow-xl hover:shadow-slate-200/50">
            <div>
              <h2 className="text-xl font-black tracking-tight">Resident Profile</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Manage your purok assignment and details.</p>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <Settings className="h-6 w-6" />
            </div>
          </Link>
        </section>


        <section className="grid gap-6 xl:grid-cols-[1fr_390px]">
          <div className="glass-card p-5 sm:p-6" id="community-announcements">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black tracking-tight">
                  Community Announcements
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  Active notices for your barangay feed.
                </p>
              </div>
              <CalendarClock className="h-5 w-5 text-slate-400" />
            </div>

            {announcements.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Bell className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">
                  No active announcements right now.
                </p>
              </div>
            ) : (
              <AnnouncementsList announcements={announcements} />
            )}
          </div>

          <aside className="glass-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight">
                  Emergency Contacts
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  Tap to call.
                </p>
              </div>
              <Phone className="h-5 w-5 text-slate-400" />
            </div>

            {contacts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  No contacts configured yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <a
                    key={contact.id}
                    href={`tel:${contact.number}`}
                    className="group flex items-center gap-3 rounded-3xl bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70"
                    aria-label={`Call ${contact.name}: ${contact.number}`}
                  >
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${contactTone(
                        contact.category
                      )}`}
                    >
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-950">
                        {contact.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                        {contact.number}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-950" />
                  </a>
                ))}
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
