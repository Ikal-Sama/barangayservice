"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { announcementSchema, type AnnouncementInput } from "@/lib/validations";
import { createAnnouncement, deleteAnnouncement } from "@/lib/actions/announcements";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Bell, Plus, Trash2, Loader2, ChevronLeft, X } from "lucide-react";
import Link from "next/link";
import type { Announcement, Purok } from "@/db/schema";
import { ANNOUNCEMENT_TYPE_META, formatRelative } from "@/lib/utils";
import type { AnnouncementType } from "@/lib/utils";

type AnnouncementWithAuthor = Announcement & { author: { name: string } };

const TYPES = [
  { value: "emergency",        label: "🚨 Emergency" },
  { value: "waste_management", label: "🗑️ Waste Management" },
  { value: "health_clinic",    label: "🏥 Health Clinic" },
  { value: "general",          label: "📢 General" },
  { value: "events",           label: "🎉 Events" },
] as const;

export default function AnnouncementsClient({
  initialAnnouncements,
  puroks,
}: {
  initialAnnouncements: AnnouncementWithAuthor[];
  puroks: Purok[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialAnnouncements);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { targetAllPuroks: true, type: "general", isActive: true },
  });

  const targetAll = watch("targetAllPuroks");

  async function onSubmit(data: AnnouncementInput) {
    const result = await createAnnouncement(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message);
    reset();
    setShowForm(false);
    // Refresh — re-fetch happens via RSC revalidation on next navigation
    window.location.reload();
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteAnnouncement(id);
      if (!result.success) { toast.error(result.error); return; }
      setItems((prev) => prev.filter((a) => a.id !== id));
      toast.success("Announcement removed.");
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors" aria-label="Back">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <Bell className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-900">Announcements</span>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "New"}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-12 space-y-5">

        {/* ── Create Form ──────────────────────────── */}
        {showForm && (
          <div className="glass-card p-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <h2 className="font-bold text-slate-900 mb-4">New Announcement</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="ann-title">Title</label>
                <input id="ann-title" type="text" placeholder="Short, clear headline…"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  {...register("title")} />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
              </div>

              {/* Body */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="ann-body">Message</label>
                <textarea id="ann-body" rows={4} placeholder="Full announcement details…"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  {...register("body")} />
                {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="ann-type">Category</label>
                <select id="ann-type"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                  {...register("type")}>
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Target */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" {...register("targetAllPuroks")} />
                  <span className="text-sm font-medium text-slate-700">Broadcast to all Puroks</span>
                </label>
                {!targetAll && (
                  <div className="mt-2 space-y-1.5 pl-6">
                    {puroks.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" value={p.id} className="w-4 h-4 rounded accent-blue-600"
                          {...register("purokIds")} />
                        <span className="text-sm text-slate-700">{p.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full hero-gradient text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Publish Announcement
              </button>
            </form>
          </div>
        )}

        {/* ── Announcements List ───────────────────── */}
        <section aria-labelledby="ann-list-heading">
          <h2 id="ann-list-heading" className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Active Announcements ({items.length})
          </h2>

          {items.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No announcements yet. Create one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((a) => {
                const typeMeta = ANNOUNCEMENT_TYPE_META[a.type as AnnouncementType];
                return (
                  <div key={a.id} className={`rounded-2xl border p-4 ${typeMeta.bg} ${typeMeta.border}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold ${typeMeta.color}`}>{typeMeta.label}</span>
                          <span className="text-xs text-slate-400">· {formatRelative(new Date(a.createdAt))}</span>
                        </div>
                        <p className="font-semibold text-sm text-slate-900 mb-1">{a.title}</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{a.body}</p>
                        <p className="text-xs text-slate-400 mt-1.5">By {a.author.name}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={isPending}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                        aria-label={`Delete announcement: ${a.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
