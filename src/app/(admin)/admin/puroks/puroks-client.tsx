"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purokSchema, type PurokInput } from "@/lib/validations";
import { createPurok, updatePurok } from "@/lib/actions/puroks";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Pencil, ChevronLeft, Loader2, X, Check } from "lucide-react";
import Link from "next/link";
import type { Purok } from "@/db/schema";

export default function PuroksClient({ initialPuroks }: { initialPuroks: Purok[] }) {
  const [puroks, setPuroks] = useState(initialPuroks);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Purok | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PurokInput>({
    resolver: zodResolver(purokSchema),
    defaultValues: { isActive: true },
  });

  function startEdit(p: Purok) {
    setEditing(p);
    setShowForm(true);
    reset({ name: p.name, description: p.description ?? "", isActive: p.isActive });
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
    reset();
  }

  async function onSubmit(data: PurokInput) {
    if (editing) {
      const result = await updatePurok(editing.id, data);
      if (!result.success) { toast.error(result.error); return; }
      setPuroks((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p))
      );
      toast.success("Purok updated.");
    } else {
      const result = await createPurok(data);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Purok created.");
      window.location.reload();
    }
    cancelForm();
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
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-900">Manage Puroks</span>
          </div>
          <button
            onClick={() => (showForm && !editing ? cancelForm() : setShowForm(true))}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Add Purok"}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-12 space-y-5">

        {/* ── Form ─────────────────────────────────── */}
        {showForm && (
          <div className="glass-card p-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <h2 className="font-bold text-slate-900 mb-4">
              {editing ? `Edit: ${editing.name}` : "New Purok"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="purok-name">
                  Purok Name
                </label>
                <input id="purok-name" type="text" placeholder="e.g. Purok 1 – Sampaguita"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  {...register("name")} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="purok-desc">
                  Description <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input id="purok-desc" type="text" placeholder="Brief description of this purok…"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  {...register("description")} />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" {...register("isActive")} />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={cancelForm}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-[2] hero-gradient text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editing ? "Save Changes" : "Create Purok"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Puroks List ───────────────────────────── */}
        <section aria-label="Puroks list">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            All Puroks ({puroks.length})
          </h2>
          {puroks.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No puroks yet. Add one above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {puroks.map((p) => (
                <div key={p.id} className="glass-card px-4 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${p.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-slate-500">{p.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(p)}
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    aria-label={`Edit ${p.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
