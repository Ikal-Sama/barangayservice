import Link from "next/link";
import {
  ArrowRight,
  Bell,
  MapPin,
  Phone,
  Radio,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Live Basura Tracker",
    description:
      "See collection status by purok from scheduled to completed without waiting outside.",
    tone: "bg-amber-100 text-amber-700",
  },
  {
    icon: Bell,
    title: "Targeted Alerts",
    description:
      "Receive urgent advisories, events, and health schedules relevant to your area.",
    tone: "bg-violet-100 text-violet-700",
  },
  {
    icon: Phone,
    title: "Emergency Lines",
    description:
      "Keep barangay, police, fire, and health contacts reachable in one clean view.",
    tone: "bg-rose-100 text-rose-700",
  },
  {
    icon: ShieldCheck,
    title: "Barangay-Owned Data",
    description:
      "A lightweight portal designed for local service delivery and resident privacy.",
    tone: "bg-emerald-100 text-emerald-700",
  },
];

export default function LandingPage() {
  const barangayName =
    process.env.NEXT_PUBLIC_BARANGAY_NAME ?? "Barangay San Isidro";

  return (
    <main className="min-h-screen bg-app-grid text-slate-950">
      <nav className="sticky top-0 z-40 border-b border-white/70 bg-white/80 px-4 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">BarangayLink</p>
              <p className="hidden text-xs font-semibold text-slate-500 sm:block">
                {barangayName}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-cyan-900"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-black text-cyan-800 shadow-sm">
            <Radio className="h-3.5 w-3.5" />
            Community operations portal
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-balance sm:text-6xl lg:text-7xl">
            BarangayLink
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-600">
            A modern resident portal for {barangayName}: live waste collection,
            local announcements, emergency contacts, and purok-aware updates in
            one responsive app.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-cyan-900"
            >
              Start as resident
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-6 py-4 text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              Admin sign in
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="glass-card overflow-hidden p-4 sm:p-5">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                    Today
                  </p>
                  <p className="mt-1 text-xl font-black">Service Pulse</p>
                </div>
                <MapPin className="h-6 w-6 text-emerald-300" />
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {["8", "24", "4"].map((value, index) => (
                  <div key={value} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-3xl font-black">{value}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">
                      {index === 0
                        ? "Puroks"
                        : index === 1
                          ? "Alerts"
                          : "Routes"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["Purok 2 - Sampaguita", "Truck en route", "bg-amber-300"],
                  ["Health Center", "Clinic open", "bg-emerald-300"],
                  ["Emergency Hotline", "Online", "bg-cyan-300"],
                ].map(([title, status, dot]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl bg-white p-3 text-slate-950"
                  >
                    <div>
                      <p className="text-sm font-black">{title}</p>
                      <p className="text-xs font-semibold text-slate-500">{status}</p>
                    </div>
                    <span className={`h-3 w-3 rounded-full ${dot}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description, tone }) => (
            <div key={title} className="glass-card p-5">
              <div className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-base font-black text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
