"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wasteScheduleCreateSchema, type WasteScheduleCreateInput } from "@/lib/validations";
import {
  Truck,
  Clock,
  PackageCheck,
  CircleCheck,
  ChevronLeft,
  Loader2,
  Plus,
  X,
  Trash2,
  CalendarDays,
} from "lucide-react";
import {
  updateWasteStatus,
  createWasteSchedule,
  deleteWasteSchedule,
} from "@/lib/actions/waste-tracker";
import { WASTE_STATUS_META } from "@/lib/utils";
import type { WasteStatus } from "@/lib/utils";
import type { WasteSchedule, Purok } from "@/db/schema";
import Link from "next/link";
import { toast } from "sonner";

type ScheduleWithPurok = WasteSchedule & { purok: Purok };

const STATUS_FLOW: WasteStatus[] = ["scheduled", "en_route", "collecting", "completed"];

const StatusIcons: Record<WasteStatus, React.ElementType> = {
  scheduled: Clock,
  en_route: Truck,
  collecting: PackageCheck,
  completed: CircleCheck,
};

// ── Status advance card ───────────────────────────────────────────────────────

function StatusToggleCard({
  schedule,
  onDelete,
  onStatusChange,
}: {
  schedule: ScheduleWithPurok;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: WasteStatus) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const currentStatus = schedule.status as WasteStatus;

  const currentIdx = STATUS_FLOW.indexOf(currentStatus);
  const nextStatus = STATUS_FLOW[currentIdx + 1] as WasteStatus | undefined;
  const isCompleted = currentStatus === "completed";

  const meta = WASTE_STATUS_META[currentStatus];
  const StatusIcon = StatusIcons[currentStatus];

  function handleAdvance() {
    if (!nextStatus || isPending) return;
    startTransition(async () => {
      const result = await updateWasteStatus({ scheduleId: schedule.id, status: nextStatus });
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onStatusChange(schedule.id, result.data.status as WasteStatus);
      toast.success(result.message);
    });
  }

  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-all ${meta.bg} ${
        currentStatus === "en_route"   ? "border-amber-200"   :
        currentStatus === "collecting" ? "border-blue-200"    :
        currentStatus === "completed"  ? "border-emerald-200" :
        "border-slate-200"
      }`}
    >
      {/* Purok name + delete */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Purok</p>
          <p className="text-base font-bold text-slate-900">{schedule.purok.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.bg} border ${
              currentStatus === "en_route"   ? "border-amber-200"   :
              currentStatus === "collecting" ? "border-blue-200"    :
              currentStatus === "completed"  ? "border-emerald-200" :
              "border-slate-200"
            }`}
          >
            <StatusIcon className={`w-5 h-5 ${meta.color}`} />
          </div>
          <button
            onClick={() => onDelete(schedule.id)}
            disabled={isPending}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label={`Remove schedule for ${schedule.purok.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-4">
        {currentStatus === "en_route" && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
        )}
        <span className={`text-lg font-bold ${meta.color}`}>{meta.label}</span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-4">
        {STATUS_FLOW.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= currentIdx
                ? currentStatus === "completed" ? "bg-emerald-500"
                  : currentStatus === "collecting" ? "bg-blue-500"
                  : currentStatus === "en_route" ? "bg-amber-500"
                  : "bg-slate-400"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Notes */}
      {schedule.notes && (
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">📋 {schedule.notes}</p>
      )}

      {/* Action button */}
      {!isCompleted ? (
        <button
          onClick={handleAdvance}
          disabled={isPending}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 ${
            nextStatus === "en_route"   ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 shadow-md" :
            nextStatus === "collecting" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 shadow-md" :
            nextStatus === "completed"  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 shadow-md" :
            "bg-slate-800 text-white"
          }`}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Mark as {WASTE_STATUS_META[nextStatus!]?.label}
        </button>
      ) : (
        <div className="w-full py-3 rounded-xl text-sm font-semibold text-center bg-emerald-50 text-emerald-700 border border-emerald-200">
          ✅ Collection Complete
        </div>
      )}
    </div>
  );
}

// ── Create schedule form ──────────────────────────────────────────────────────

function CreateScheduleForm({
  puroks,
  onCreated,
}: {
  puroks: Purok[];
  onCreated: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WasteScheduleCreateInput>({
    resolver: zodResolver(wasteScheduleCreateSchema),
    defaultValues: {
      scheduledDate: new Date().toISOString().slice(0, 16),
    },
  });

  async function onSubmit(data: WasteScheduleCreateInput) {
    const result = await createWasteSchedule(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message);
    reset({ scheduledDate: new Date().toISOString().slice(0, 16) });
    onCreated();
  }

  return (
    <div className="glass-card p-5 animate-in fade-in slide-in-from-top-2 duration-200">
      <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-blue-600" />
        Create Collection Schedule
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

        {/* Purok */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="sched-purok">
            Purok
          </label>
          <select
            id="sched-purok"
            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
            {...register("purokId")}
          >
            <option value="">Select a Purok…</option>
            {puroks.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.purokId && <p className="mt-1 text-xs text-red-600">{errors.purokId.message}</p>}
        </div>

        {/* Date & time */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="sched-date">
            Scheduled Date &amp; Time
          </label>
          <input
            id="sched-date"
            type="datetime-local"
            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            {...register("scheduledDate")}
          />
          {errors.scheduledDate && (
            <p className="mt-1 text-xs text-red-600">{errors.scheduledDate.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="sched-notes">
            Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="sched-notes"
            type="text"
            placeholder="e.g. Delayed — truck returns 3 PM"
            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            {...register("notes")}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full hero-gradient text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Schedule
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────

export default function BasuraTrackerClient({
  schedules: initialSchedules,
  puroks,
}: {
  schedules: ScheduleWithPurok[];
  puroks: Purok[];
}) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteWasteSchedule(id);
      if (!result.success) { toast.error(result.error); return; }
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      toast.success("Schedule removed.");
    });
  }

  function handleStatusChange(id: string, status: WasteStatus) {
    const now = new Date();
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id
          ? {
              ...schedule,
              status,
              updatedAt: now,
              arrivedAt:
                status === "collecting" && !schedule.arrivedAt
                  ? now
                  : schedule.arrivedAt,
              completedAt: status === "completed" ? now : schedule.completedAt,
            }
          : schedule
      )
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
              aria-label="Back to dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-slate-900">Basura Tracker</span>
            </div>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Add Schedule"}
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 pb-12 space-y-5">

        {/* Create form */}
        {showForm && (
          <CreateScheduleForm
            puroks={puroks}
            onCreated={() => {
              setShowForm(false);
              window.location.reload();
            }}
          />
        )}

        {/* Hint */}
        {!showForm && schedules.length > 0 && (
          <p className="text-sm text-slate-500">
            Tap each card to advance the collection status for that Purok.
          </p>
        )}

        {/* Schedule cards */}
        {schedules.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600 mb-1">No Schedules Today</p>
            <p className="text-sm text-slate-400 mb-4">
              Click <strong>Add Schedule</strong> to set up today's collection routes.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 hero-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((s) => (
              <StatusToggleCard
                key={s.id}
                schedule={s}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
