"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emergencyContactSchema, type EmergencyContactInput } from "@/lib/validations";
import {
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from "@/lib/actions/emergency-contacts";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Phone,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  Loader2,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import type { EmergencyContact } from "@/db/schema";

const CATEGORIES = [
  { value: "barangay", label: "🏛️ Barangay", bg: "bg-blue-50",   badge: "bg-blue-100 text-blue-700" },
  { value: "fire",     label: "🔥 Fire",      bg: "bg-orange-50", badge: "bg-orange-100 text-orange-700" },
  { value: "police",   label: "👮 Police",    bg: "bg-indigo-50", badge: "bg-indigo-100 text-indigo-700" },
  { value: "health",   label: "🏥 Health",    bg: "bg-teal-50",   badge: "bg-teal-100 text-teal-700" },
] as const;

function getCategoryMeta(cat: string) {
  return CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[0];
}

export default function ContactsClient({
  initialContacts,
}: {
  initialContacts: EmergencyContact[];
}) {
  const [contacts, setContacts] = useState(initialContacts);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmergencyContactInput>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: { isActive: true, sortOrder: 0, category: "barangay" },
  });

  function startEdit(c: EmergencyContact) {
    setEditing(c);
    setShowForm(true);
    reset({
      name: c.name,
      number: c.number,
      category: c.category as EmergencyContactInput["category"],
      iconName: c.iconName ?? "",
      isActive: c.isActive,
      sortOrder: c.sortOrder,
    });
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
    reset({ isActive: true, sortOrder: 0, category: "barangay" });
  }

  async function onSubmit(data: EmergencyContactInput) {
    if (editing) {
      const result = await updateEmergencyContact(editing.id, data);
      if (!result.success) { toast.error(result.error); return; }
      setContacts((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c))
      );
      toast.success("Contact updated.");
    } else {
      const result = await createEmergencyContact(data);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Contact added.");
      window.location.reload();
    }
    cancelForm();
  }

  function handleDelete(id: string, name: string) {
    startTransition(async () => {
      const result = await deleteEmergencyContact(id);
      if (!result.success) { toast.error(result.error); return; }
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success(`"${name}" removed.`);
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <Phone className="w-5 h-5 text-red-600" />
            <span className="font-bold text-slate-900">Emergency Contacts</span>
          </div>
          <button
            onClick={() => (showForm && !editing ? cancelForm() : setShowForm(true))}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            {showForm && !editing ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm && !editing ? "Cancel" : "Add Contact"}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-12 space-y-5">

        {/* ── Form ──────────────────────────────────────── */}
        {showForm && (
          <div className="glass-card p-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <h2 className="font-bold text-slate-900 mb-4">
              {editing ? `Edit: ${editing.name}` : "New Emergency Contact"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="contact-name">
                  Name / Label
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="e.g. Barangay San Isidro Hotline"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  {...register("name")}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              {/* Number */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="contact-number">
                  Phone Number
                </label>
                <input
                  id="contact-number"
                  type="tel"
                  placeholder="09XXXXXXXXX or (02) XXXX-XXXX"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  {...register("number")}
                />
                {errors.number && <p className="mt-1 text-xs text-red-600">{errors.number.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="contact-category">
                  Category
                </label>
                <select
                  id="contact-category"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                  {...register("category")}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort order */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1" htmlFor="contact-sort">
                  Sort Order <span className="text-slate-400 font-normal">(lower = appears first)</span>
                </label>
                <input
                  id="contact-sort"
                  type="number"
                  min={0}
                  placeholder="0"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  {...register("sortOrder", { valueAsNumber: true })}
                />
              </div>

              {/* Active */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" {...register("isActive")} />
                <span className="text-sm font-medium text-slate-700">Active (visible to residents)</span>
              </label>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] hero-gradient text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editing ? "Save Changes" : "Add Contact"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Contacts List ─────────────────────────────── */}
        <section aria-label="Emergency contacts list">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            All Contacts ({contacts.length})
          </h2>

          {contacts.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Phone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No contacts yet. Add one above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => {
                const meta = getCategoryMeta(c.category);
                return (
                  <div
                    key={c.id}
                    className={`glass-card px-4 py-3.5 flex items-center justify-between gap-3 ${
                      !c.isActive ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${meta.bg}`}>
                        {meta.label.split(" ")[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-slate-900 truncate">{c.name}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.badge}`}>
                            {c.category}
                          </span>
                          {!c.isActive && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-blue-600 font-mono mt-0.5">{c.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(c)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        aria-label={`Edit ${c.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        disabled={isPending}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={`Delete ${c.name}`}
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
