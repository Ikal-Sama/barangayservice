import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Waste status helpers ──────────────────────────────────────────────────────

export type WasteStatus = "scheduled" | "en_route" | "collecting" | "completed";

export const WASTE_STATUS_META: Record<
  WasteStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  scheduled: {
    label: "Scheduled",
    color: "text-slate-500",
    bg: "bg-slate-100",
    icon: "Clock",
  },
  en_route: {
    label: "En Route",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: "Truck",
  },
  collecting: {
    label: "Collecting",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: "PackageCheck",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    icon: "CircleCheck",
  },
};

// ── Announcement type helpers ─────────────────────────────────────────────────

export type AnnouncementType =
  | "emergency"
  | "waste_management"
  | "health_clinic"
  | "general"
  | "events";

export const ANNOUNCEMENT_TYPE_META: Record<
  AnnouncementType,
  { label: string; color: string; bg: string; border: string }
> = {
  emergency: {
    label: "🚨 Emergency",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
  },
  waste_management: {
    label: "🗑️ Waste Management",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
  },
  health_clinic: {
    label: "🏥 Health Clinic",
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-300",
  },
  general: {
    label: "📢 General",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
  },
  events: {
    label: "🎉 Events",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-300",
  },
};

// ── Date helpers ──────────────────────────────────────────────────────────────

export function formatRelative(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
