"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { broadcastMessage } from "@/lib/actions/broadcast";

interface FormValues {
  subject: string;
  html: string;
  purokId?: string;
  role?: "admin" | "resident";
}

export default function BroadcastPage() {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      const result = await broadcastMessage(data);
      if (result.success) {
        toast.success(`Broadcast sent to ${result.count} users.`);
        reset();
      } else {
        toast.error("Broadcast failed.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Unexpected error while broadcasting.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Broadcast Messaging</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            className="w-full border rounded p-2"
            {...register("subject", { required: true })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="html">Message (HTML)</label>
          <textarea
            id="html"
            rows={6}
            className="w-full border rounded p-2"
            {...register("html", { required: true })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="purokId">Purok (optional)</label>
          <input id="purokId" type="text" className="w-full border rounded p-2" {...register("purokId")} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="role">Role (optional)</label>
          <select id="role" className="w-full border rounded p-2" {...register("role")}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="resident">Resident</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send Broadcast"}
        </button>
      </form>
    </div>
  );
}
