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
  Filter,
  Inbox,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  ShieldAlert,
  Trash2,
  User,
  VolumeX,
  Wrench,
  X,
} from "lucide-react";
import {
  updateIncidentReportStatusSchema,
  type UpdateIncidentReportStatusInput,
} from "@/lib/validations";
import { updateIncidentReportStatus } from "@/lib/actions/reports";

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
  user: {
    id: string;
    name: string;
    mobileNumber: string | null;
    purok: {
      id: string;
      name: string;
    } | null;
  };
};

type AdminReportsClientProps = {
  initialReports: any[];
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
  pending: { label: "Pending", icon: Clock, tone: "bg-blue-50 text-blue-700 border-blue-100" },
  investigating: { label: "Investigating", icon: Loader2, tone: "bg-amber-50 text-amber-700 border-amber-100" },
  resolved: { label: "Resolved", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  closed: { label: "Closed", icon: AlertCircle, tone: "bg-slate-100 text-slate-600 border-slate-200" },
} as const;

export function AdminReportsClient({ initialReports }: AdminReportsClientProps) {
  const [reports, setReports] = useState<ReportType[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateIncidentReportStatusInput>({
    resolver: zodResolver(updateIncidentReportStatusSchema),
  });

  const handleSelectReport = (report: ReportType) => {
    setSelectedReport(report);
    setValue("id", report.id);
    setValue("status", report.status);
    setValue("adminNotes", report.adminNotes || "");
  };

  const handleCloseDrawer = () => {
    setSelectedReport(null);
  };

  const onSubmit = (data: UpdateIncidentReportStatusInput) => {
    startTransition(async () => {
      const res = await updateIncidentReportStatus(data);
      if (res.success) {
        toast.success(res.message);
        // Update local state to maintain snappy reactive UX
        setReports((prev) =>
          prev.map((r) =>
            r.id === data.id
              ? {
                  ...r,
                  status: data.status,
                  adminNotes: data.adminNotes || null,
                  updatedAt: new Date(),
                }
              : r
          )
        );
        // Sync selected report display
        if (selectedReport) {
          setSelectedReport({
            ...selectedReport,
            status: data.status,
            adminNotes: data.adminNotes || null,
            updatedAt: new Date(),
          });
        }
      } else {
        toast.error(res.error || "Failed to update report status.");
      }
    });
  };

  // Metrics Calculations
  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const investigatingCount = reports.filter((r) => r.status === "investigating").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved" || r.status === "closed").length;

  // Filtered Reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.purok?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Section */}
      <section className="grid gap-4 sm:grid-cols-4">
        <div className="glass-card p-5">
          <p className="text-sm font-semibold text-slate-500">Total Reports</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{totalCount}</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-blue-600">Pending Review</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{pendingCount}</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-amber-500">
          <p className="text-sm font-semibold text-amber-600">Investigating</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{investigatingCount}</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-emerald-500">
          <p className="text-sm font-semibold text-emerald-600">Resolved / Closed</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{resolvedCount}</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        {/* Main List Column */}
        <section className="glass-card p-5 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search title, reporter, description or purok..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm font-medium text-slate-950 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-slate-400"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-slate-400"
              >
                <option value="all">All Categories</option>
                <option value="waste">Waste & Sanitation</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="noise">Noise</option>
                <option value="safety">Safety</option>
                <option value="health">Public Health</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* List Display */}
          <div className="space-y-2">
            {filteredReports.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center">
                <Inbox className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-500">No matching reports found.</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const categoryMeta = CATEGORIES.find((c) => c.value === report.category);
                const statusMeta = STATUS_META[report.status];
                const StatusIcon = statusMeta.icon;
                const isSelected = selectedReport?.id === report.id;

                return (
                  <button
                    key={report.id}
                    onClick={() => handleSelectReport(report)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? "border-slate-950 bg-slate-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${categoryMeta?.tone}`}>
                            {categoryMeta?.label}
                          </span>
                          <span className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full border text-[10px] font-black ${statusMeta.tone}`}>
                            <StatusIcon className="h-2.5 w-2.5" />
                            {statusMeta.label}
                          </span>
                          {report.purok && (
                            <span className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              <MapPin className="h-2.5 w-2.5 text-slate-400" />
                              {report.purok.name}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-slate-950 truncate">{report.title}</h4>
                        <p className="text-xs font-semibold text-slate-500">
                          By {report.user.name} • {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Action Panel Column (Master-Detail Drawer) */}
        <aside className="lg:sticky lg:top-24">
          {!selectedReport ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <AlertTriangle className="mx-auto h-7 w-7 text-slate-300" />
              <h4 className="mt-3 text-sm font-black text-slate-950">Select a report</h4>
              <p className="mt-1 text-xs text-slate-400">
                Click any report from the list to review details, contact the resident, or update progress.
              </p>
            </div>
          ) : (
            <div className="glass-card p-6 space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <h3 className="text-base font-black text-slate-950">Incident Details</h3>
                <button
                  onClick={handleCloseDrawer}
                  className="grid h-8 w-8 place-items-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-950 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Reporter Contact Info */}
              <div className="space-y-3.5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950">{selectedReport.user.name}</p>
                      <p className="text-xs font-semibold text-slate-400">Submitted Complaint</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-200/50 pt-2.5">
                    {selectedReport.user.mobileNumber && (
                      <a
                        href={`tel:${selectedReport.user.mobileNumber}`}
                        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition"
                      >
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedReport.user.mobileNumber}</span>
                      </a>
                    )}
                    {selectedReport.purok && (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedReport.purok.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Complaint Text details */}
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-950">{selectedReport.title}</h4>
                  <p className="text-xs leading-5 font-semibold text-slate-600">{selectedReport.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Filed on {new Date(selectedReport.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Update Status form */}
              <form onSubmit={handleSubmit(onSubmit)} className="border-t border-slate-150 pt-4 space-y-4">
                <div>
                  <label htmlFor="status" className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Action Status
                  </label>
                  <select
                    id="status"
                    {...register("status")}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-400"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="investigating">Under Investigation</option>
                    <option value="resolved">Mark Resolved</option>
                    <option value="closed">Close Ticket</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-xs font-bold text-red-500">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="adminNotes" className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Official Response Remarks
                  </label>
                  <textarea
                    id="adminNotes"
                    rows={3}
                    placeholder="Provide official feedback to the resident. (e.g. 'Barangay electrician dispatched...')"
                    {...register("adminNotes")}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 placeholder-slate-400 outline-none transition focus:border-slate-400"
                  />
                  {errors.adminNotes && (
                    <p className="mt-1 text-xs font-bold text-red-500">{errors.adminNotes.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
