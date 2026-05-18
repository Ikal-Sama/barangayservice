"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateDocumentRequestStatusSchema, type UpdateDocumentRequestStatusInput } from "@/lib/validations";
import { updateDocumentRequestStatus } from "@/lib/actions/documents";
import { FileText, Search, Filter, AlertCircle, Edit, CheckCircle } from "lucide-react";
import { formatRelative } from "@/lib/utils";

const DOCUMENT_TYPES = [
  { value: "barangay_clearance", label: "Barangay Clearance" },
  { value: "certificate_of_indigency", label: "Certificate of Indigency" },
  { value: "business_clearance", label: "Business Clearance" },
  { value: "green_card", label: "Green Card" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-700" },
  { value: "ready_for_pickup", label: "Ready for Pickup", color: "bg-green-100 text-green-700" },
  { value: "completed", label: "Completed", color: "bg-slate-100 text-slate-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
];

export function RequestsClient({ requests }: { requests: any[] }) {
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateDocumentRequestStatusInput>({
    resolver: zodResolver(updateDocumentRequestStatusSchema),
  });

  const openModal = (req: any) => {
    setSelectedRequest(req);
    reset({
      id: req.id,
      status: req.status,
      adminNotes: req.adminNotes || "",
    });
    setError(null);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    reset();
  };

  const onSubmit = async (data: UpdateDocumentRequestStatusInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await updateDocumentRequestStatus(data);
      if (!res.success) {
        setError(res.error || "Failed to update request.");
      } else {
        closeModal();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(
    (req) => filter === "all" || req.status === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">
            Document Requests
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Review and process resident document requests.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition ${
            filter === "all"
              ? "bg-slate-950 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Requests
        </button>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status.value}
            onClick={() => setFilter(status.value)}
            className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition ${
              filter === status.value
                ? "bg-slate-950 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Resident</th>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <FileText className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    <p className="font-semibold">No requests found.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-950">
                        {req.user?.name || "Unknown Resident"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {req.user?.purok?.name || "No Purok"}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {req.user?.mobileNumber || req.user?.email || "No contact info"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {DOCUMENT_TYPES.find((t) => t.value === req.type)?.label || req.type}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={req.purpose}>
                      {req.purpose}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {formatRelative(new Date(req.createdAt))}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${
                          STATUS_OPTIONS.find((s) => s.value === req.status)?.color
                        }`}
                      >
                        {req.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(req)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white text-left align-middle shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-black tracking-tight text-slate-950">
                Update Request Status
              </h3>
            </div>
            <div className="bg-slate-50 p-6 text-sm">
              <div className="mb-3 border-b border-slate-200 pb-3">
                <span className="font-bold text-slate-500 block mb-1">Resident Details:</span>
                <div className="font-bold text-slate-950">{selectedRequest.user?.name}</div>
                <div className="text-slate-600 mt-1">
                  📍 {selectedRequest.user?.purok?.name || "No Purok"}
                </div>
                <div className="text-slate-600">
                  📞 {selectedRequest.user?.mobileNumber || "No phone"}
                </div>
                <div className="text-slate-600">
                  ✉️ {selectedRequest.user?.email || "No email"}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-bold text-slate-500">Document:</span>{" "}
                <span className="font-bold text-slate-950">
                  {DOCUMENT_TYPES.find((t) => t.value === selectedRequest.type)?.label}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block mb-1">Purpose:</span>
                <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                  {selectedRequest.purpose}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4">
              {error && (
                <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              
              <input type="hidden" {...register("id")} />

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-slate-950 focus:bg-white focus:ring-1 focus:ring-slate-950"
                  >
                    {STATUS_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    {...register("adminNotes")}
                    rows={3}
                    placeholder="e.g. Please bring a valid ID and 50 pesos fee."
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:bg-white focus:ring-1 focus:ring-slate-950"
                  />
                  {errors.adminNotes && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.adminNotes.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSubmitting ? "Saving..." : <><CheckCircle className="h-4 w-4" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
