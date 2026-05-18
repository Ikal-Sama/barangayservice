"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  ShieldAlert,
  Trash2,
  VolumeX,
  Wrench,
} from "lucide-react";
import {
  incidentReportSchema,
  type IncidentReportInput,
} from "@/lib/validations";
import { createIncidentReport } from "@/lib/actions/reports";

type ReportType = {
  id: string;
  category: "waste" | "infrastructure" | "noise" | "safety" | "health" | "other";
  title: string;
  description: string;
  status: "pending" | "investigating" | "resolved" | "closed";
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  purok: {
    id: string;
    name: string;
  } | null;
};

type ResidentReportsClientProps = {
  initialReports: any[];
  puroks: { id: string; name: string }[];
  userPurokId?: string;
};

const CATEGORIES = [
  { value: "waste", label: "Waste & Sanitation", icon: Trash2, tone: "bg-teal-50 border-teal-100 text-teal-700" },
  { value: "infrastructure", label: "Infrastructure / Utilities", icon: Wrench, tone: "bg-blue-50 border-blue-100 text-blue-700" },
  { value: "noise", label: "Noise / Nuisance", icon: VolumeX, tone: "bg-amber-50 border-amber-100 text-amber-700" },
  { value: "safety", label: "Safety & Security", icon: ShieldAlert, tone: "bg-rose-50 border-rose-100 text-rose-700" },
  { value: "health", label: "Public Health / Clinic", icon: Activity, tone: "bg-emerald-50 border-emerald-100 text-emerald-700" },
  { value: "other", label: "Other Feedback", icon: FileText, tone: "bg-slate-50 border-slate-100 text-slate-700" },
] as const;

const STATUS_META = {
  pending: { label: "Pending Review", icon: Clock, tone: "bg-blue-50 text-blue-700 border-blue-100" },
  investigating: { label: "Under Investigation", icon: Loader2, tone: "bg-amber-50 text-amber-700 border-amber-100 animate-spin-slow" },
  resolved: { label: "Resolved", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  closed: { label: "Closed", icon: AlertCircle, tone: "bg-slate-100 text-slate-600 border-slate-200" },
} as const;

export function ResidentReportsClient({
  initialReports,
  puroks,
  userPurokId,
}: ResidentReportsClientProps) {
  const [reports, setReports] = useState<ReportType[]>(initialReports);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncidentReportInput>({
    resolver: zodResolver(incidentReportSchema),
    defaultValues: {
      title: "",
      category: "other",
      description: "",
      purokId: userPurokId || "",
    },
  });

  const onSubmit = (data: IncidentReportInput) => {
    startTransition(async () => {
      const res = await createIncidentReport(data);
      if (res.success) {
        toast.success(res.message);
        setIsSubmitOpen(false);
        reset();
        // Optimistically add report to local state with current date
        const selectedPurok = puroks.find((p) => p.id === data.purokId) || null;
        const newReport: ReportType = {
          id: res.data.id,
          title: data.title,
          category: data.category,
          description: data.description,
          status: "pending",
          adminNotes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          purok: selectedPurok,
        };
        setReports((prev) => [newReport, ...prev]);
      } else {
        toast.error(res.error || "Failed to submit report.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Upper Panel Banner */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Your Incident Reports</h2>
          <p className="text-sm font-medium text-slate-500">
            Submit neighborhood issues and track their progress from start to finish.
          </p>
        </div>
        <button
          onClick={() => setIsSubmitOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          {isSubmitOpen ? "Close Form" : "File a Report"}
        </button>
      </section>

      {/* Report Form Collapse */}
      {isSubmitOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card animate-in slide-in-from-top-4 duration-300 p-6 space-y-4"
        >
          <h3 className="text-lg font-black text-slate-950">New Incident Report</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Report Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Broken Streetlight on Flores Ave"
                {...register("title")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
              {errors.title && (
                <p className="mt-1 text-xs font-bold text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Issue Category
              </label>
              <select
                id="category"
                {...register("category")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              >
                <option value="waste">Waste & Sanitation</option>
                <option value="infrastructure">Infrastructure / Utilities</option>
                <option value="noise">Noise / Nuisance</option>
                <option value="safety">Safety & Security</option>
                <option value="health">Public Health / Clinic</option>
                <option value="other">Other Feedback</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-xs font-bold text-red-500">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="purokId" className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Location Purok (Optional)
              </label>
              <select
                id="purokId"
                {...register("purokId")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              >
                <option value="">Choose a Location...</option>
                {puroks.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.purokId && (
                <p className="mt-1 text-xs font-bold text-red-500">{errors.purokId.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
              Description & Specific Location Details
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Please describe the issue in detail, including specific landmarks to help our team locate it."
              {...register("description")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
            {errors.description && (
              <p className="mt-1 text-xs font-bold text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSubmitOpen(false)}
              disabled={isPending}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Report
            </button>
          </div>
        </form>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-400">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-black text-slate-950">No reports filed yet</h3>
            <p className="mt-1 text-sm font-medium text-slate-500 max-w-sm mx-auto">
              Whenever you notice an issue in your Purok, file a report here so the Barangay can act.
            </p>
          </div>
        ) : (
          reports.map((report) => {
            const categoryMeta = CATEGORIES.find((c) => c.value === report.category);
            const statusMeta = STATUS_META[report.status];
            const StatusIcon = statusMeta.icon;
            const CategoryIcon = categoryMeta?.icon || FileText;

            return (
              <div
                key={report.id}
                className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${categoryMeta?.tone}`}>
                        <CategoryIcon className="h-3.5 w-3.5" />
                        {categoryMeta?.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-full border text-xs font-bold ${statusMeta.tone}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusMeta.label}
                      </span>
                      {report.purok && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {report.purok.name}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-black tracking-tight text-slate-950">{report.title}</h3>
                      <p className="mt-1 text-sm leading-6 font-medium text-slate-600">{report.description}</p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Submitted on {new Date(report.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}</span>
                    </div>
                  </div>
                </div>

                {report.adminNotes && (
                  <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="flex items-start gap-2.5">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-200 text-slate-700">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400">Barangay Response</p>
                        <p className="mt-0.5 text-sm leading-5 font-semibold text-slate-700">{report.adminNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
