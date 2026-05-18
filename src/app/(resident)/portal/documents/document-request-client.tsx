"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentRequestSchema, type DocumentRequestInput } from "@/lib/validations";
import { createDocumentRequest } from "@/lib/actions/documents";
import { Plus, X, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatRelative } from "@/lib/utils";

const DOCUMENT_TYPES = [
  { value: "barangay_clearance", label: "Barangay Clearance" },
  { value: "certificate_of_indigency", label: "Certificate of Indigency" },
  { value: "business_clearance", label: "Business Clearance" },
  { value: "green_card", label: "Green Card" },
  { value: "other", label: "Other" },
];

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  ready_for_pickup: "bg-green-100 text-green-700",
  completed: "bg-slate-100 text-slate-700",
  rejected: "bg-red-100 text-red-700",
};

export function DocumentRequestClient({ requests }: { requests: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentRequestInput>({
    resolver: zodResolver(documentRequestSchema),
    defaultValues: {
      type: "barangay_clearance",
      purpose: "",
    },
  });

  const onSubmit = async (data: DocumentRequestInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await createDocumentRequest(data);
      if (!res.success) {
        setError(res.error || "Failed to submit request.");
      } else {
        reset();
        setIsModalOpen(false);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight">Your Requests</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Request Document
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FileText className="mx-auto mb-4 h-8 w-8 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-900">No requests yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Need a clearance or certificate? Request one now.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${
                    STATUS_COLORS[req.status as keyof typeof STATUS_COLORS]
                  }`}
                >
                  {req.status.replace(/_/g, " ")}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {formatRelative(new Date(req.createdAt))}
                </span>
              </div>
              <h4 className="text-lg font-black tracking-tight text-slate-900">
                {DOCUMENT_TYPES.find((t) => t.value === req.type)?.label || req.type}
              </h4>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {req.purpose}
              </p>
              {req.adminNotes && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 border border-slate-100">
                  <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Admin Note:</span>
                  {req.adminNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white text-left align-middle shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-black tracking-tight text-slate-950">
                Request Document
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {error && (
                <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">
                    Document Type
                  </label>
                  <select
                    {...register("type")}
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:bg-white focus:ring-1 focus:ring-slate-950"
                  >
                    {DOCUMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">
                    Purpose
                  </label>
                  <textarea
                    {...register("purpose")}
                    rows={4}
                    placeholder="e.g. For employment requirements"
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:bg-white focus:ring-1 focus:ring-slate-950"
                  />
                  {errors.purpose && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.purpose.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
