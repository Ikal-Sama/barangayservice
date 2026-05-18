"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Purok } from "@/db/schema";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    mobileNumber?: string;
    purokId?: string;
  };
  puroks: Purok[];
}

export default function ProfileForm({ user, puroks }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name || "",
      mobileNumber: user.mobileNumber || "",
      purokId: user.purokId || "",
    },
  });

  async function onSubmit(data: UpdateProfileInput) {
    setLoading(true);
    try {
      const result = await authClient.updateUser({
        name: data.name,
        // @ts-expect-error Better Auth additional fields
        mobileNumber: data.mobileNumber,
        purokId: data.purokId,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to update profile.");
        return;
      }

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="w-full px-3.5 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
        />
        <p className="mt-1 text-[11px] text-slate-400">Email address cannot be changed.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="name">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Juan Dela Cruz"
          className="w-full px-3.5 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
          {...register("name")}
        />
        {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="mobile">
          Mobile Number <span className="font-normal">(optional)</span>
        </label>
        <input
          id="mobile"
          type="tel"
          placeholder="09XXXXXXXXX"
          className="w-full px-3.5 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
          {...register("mobileNumber")}
        />
        {errors.mobileNumber && (
          <p className="mt-1.5 text-xs text-red-600">{errors.mobileNumber.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="purok">
          Your Purok
        </label>
        <select
          id="purok"
          className="w-full px-3.5 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition appearance-none"
          {...register("purokId")}
        >
          <option value="">Select your Purok…</option>
          {puroks.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {errors.purokId && <p className="mt-1.5 text-xs text-red-600">{errors.purokId.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading || !isDirty}
        className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Save Changes
      </button>
    </form>
  );
}
