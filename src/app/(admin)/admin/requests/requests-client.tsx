"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
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
  User,
  X,
} from "lucide-react";
import {
  updateDocumentRequestStatusSchema,
  type UpdateDocumentRequestStatusInput,
} from "@/lib/validations";
import { updateDocumentRequestStatus } from "@/lib/actions/documents";

const DOCUMENT_TYPES = [
  { value: "barangay_clearance", label: "Barangay Clearance", tone: "bg-blue-50 border-blue-100 text-blue-700" },
  { value: "certificate_of_indigency", label: "Certificate of Indigency", tone: "bg-teal-50 border-teal-100 text-teal-700" },
  { value: "business_clearance", label: "Business Clearance", tone: "bg-amber-50 border-amber-100 text-amber-700" },
  { value: "green_card", label: "Green Card", tone: "bg-emerald-50 border-emerald-100 text-emerald-700" },
  { value: "other", label: "Other Document", tone: "bg-slate-50 border-slate-100 text-slate-700" },
] as const;

const STATUS_META = {
  pending: { label: "Pending", icon: Clock, tone: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  processing: { label: "Processing", icon: Loader2, tone: "bg-blue-50 text-blue-700 border-blue-100" },
  ready_for_pickup: { label: "Ready for Pickup", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse" },
  completed: { label: "Completed", icon: CheckCircle2, tone: "bg-slate-100 text-slate-600 border-slate-200" },
  rejected: { label: "Rejected", icon: AlertCircle, tone: "bg-rose-50 text-rose-700 border-rose-100" },
} as const;

export function RequestsClient({ requests }: { requests: any[] }) {
  const [requestsList, setRequestsList] = useState<any[]>(requests);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateDocumentRequestStatusInput>({
    resolver: zodResolver(updateDocumentRequestStatusSchema),
  });

  const handleSelectRequest = (req: any) => {
    setSelectedRequest(req);
    setValue("id", req.id);
    setValue("status", req.status);
    setValue("adminNotes", req.adminNotes || "");
  };

  const handleCloseDrawer = () => {
    setSelectedRequest(null);
  };

  const onSubmit = (data: UpdateDocumentRequestStatusInput) => {
    startTransition(async () => {
      try {
        const res = await updateDocumentRequestStatus(data);
        if (res.success) {
          toast.success(res.message || "Document request updated successfully.");
          // Update local state to maintain snappy reactive UX
          setRequestsList((prev) =>
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
          // Sync selected request display safely using a functional updater to avoid overwriting a newly-selected request
          setSelectedRequest((prev: any) =>
            prev && prev.id === data.id
              ? {
                  ...prev,
                  status: data.status,
                  adminNotes: data.adminNotes || null,
                  updatedAt: new Date(),
                }
              : prev
          );
        } else {
          toast.error(res.error || "Failed to update request status.");
        }
      } catch (err: any) {
        console.error("Error updating document request:", err);
        toast.error(err?.message || "An unexpected error occurred while updating the request.");
      }
    });
  };

  // Metrics Calculations
  const totalCount = requestsList.length;
  const pendingCount = requestsList.filter((r) => r.status === "pending").length;
  const processingCount = requestsList.filter((r) => r.status === "processing" || r.status === "ready_for_pickup").length;
  const completedCount = requestsList.filter((r) => r.status === "completed").length;

  // Filtered Requests
  const filteredRequests = requestsList.filter((r) => {
    const matchesSearch =
      r.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.user.purok?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesType = typeFilter === "all" || r.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Section */}
      <section className="grid gap-4 sm:grid-cols-4">
        <div className="glass-card p-5">
          <p className="text-sm font-semibold text-slate-500">Total Requests</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{totalCount}</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-yellow-500">
          <p className="text-sm font-semibold text-yellow-600">Pending Review</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{pendingCount}</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-blue-600">In Progress</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{processingCount}</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-slate-500">
          <p className="text-sm font-semibold text-slate-600">Completed Requests</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{completedCount}</p>
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
                placeholder="Search resident, purpose, document type or purok..."
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
                <option value="processing">Processing</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-slate-400"
              >
                <option value="all">All Documents</option>
                <option value="barangay_clearance">Barangay Clearance</option>
                <option value="certificate_of_indigency">Certificate of Indigency</option>
                <option value="business_clearance">Business Clearance</option>
                <option value="green_card">Green Card</option>
                <option value="other">Other Document</option>
              </select>
            </div>
          </div>

          {/* List Display */}
          <div className="space-y-2">
            {filteredRequests.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center">
                <Inbox className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-500">No matching document requests found.</p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const docTypeMeta = DOCUMENT_TYPES.find((d) => d.value === req.type) || {
                  label: req.type.replace(/_/g, " "),
                  tone: "bg-slate-50 border-slate-100 text-slate-700"
                };
                const statusMeta = STATUS_META[req.status as keyof typeof STATUS_META] || {
                  label: req.status,
                  tone: "bg-slate-50 text-slate-500 border-slate-100",
                  icon: Clock
                };
                const StatusIcon = statusMeta.icon;
                const isSelected = selectedRequest?.id === req.id;

                return (
                  <button
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? "border-slate-950 bg-slate-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${docTypeMeta.tone}`}>
                            {docTypeMeta.label}
                          </span>
                          <span className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full border text-[10px] font-black ${statusMeta.tone}`}>
                            <StatusIcon className="h-2.5 w-2.5" />
                            {statusMeta.label}
                          </span>
                          {req.user.purok && (
                            <span className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              <MapPin className="h-2.5 w-2.5 text-slate-400" />
                              {req.user.purok.name}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-slate-950 truncate max-w-md">
                          Request for: {docTypeMeta.label}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 line-clamp-1">
                          Purpose: {req.purpose}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                          By {req.user.name} • {new Date(req.createdAt).toLocaleDateString()}
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
          {!selectedRequest ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <AlertTriangle className="mx-auto h-7 w-7 text-slate-300" />
              <h4 className="mt-3 text-sm font-black text-slate-950">Select a request</h4>
              <p className="mt-1 text-xs text-slate-400">
                Click any document request from the list to review details, contact the resident, or process documents.
              </p>
            </div>
          ) : (
            <div className="glass-card p-6 space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <h3 className="text-base font-black text-slate-950">Request Details</h3>
                <button
                  onClick={handleCloseDrawer}
                  className="grid h-8 w-8 place-items-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-950 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Requester Contact Info */}
              <div className="space-y-3.5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950">{selectedRequest.user.name}</p>
                      <p className="text-xs font-semibold text-slate-400">Resident Submitter</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-200/50 pt-2.5">
                    {selectedRequest.user.mobileNumber && (
                      <a
                        href={`tel:${selectedRequest.user.mobileNumber}`}
                        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition"
                      >
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedRequest.user.mobileNumber}</span>
                      </a>
                    )}
                    {selectedRequest.user.purok && (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{selectedRequest.user.purok.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Purpose and details */}
                <div className="space-y-1 bg-white p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Request Purpose</span>
                  <p className="text-xs leading-5 font-semibold text-slate-700">{selectedRequest.purpose}</p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Submitted on {new Date(selectedRequest.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Update Status Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="border-t border-slate-150 pt-4 space-y-4">
                <div>
                  <label htmlFor="status" className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Process Status
                  </label>
                  <select
                    id="status"
                    {...register("status")}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-400"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="processing">Under Processing</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="completed">Completed / Issued</option>
                    <option value="rejected">Rejected / Cancelled</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-xs font-bold text-red-500">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="adminNotes" className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Official Pickup Notes / Remarks
                  </label>
                  <textarea
                    id="adminNotes"
                    rows={3}
                    placeholder="Provide pickup details. (e.g. 'Ready at window 2, please prepare 50 PHP printing fee.')"
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
