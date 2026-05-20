"use client";

import { useForm } from "react-hook-form";
import { updateNotificationPreferences } from "@/lib/actions/userPreferences";
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
    notifyEmail?: boolean;
    notifySms?: boolean;
    notifyPush?: boolean;
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
  } = useForm<any>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name || "",
      mobileNumber: user.mobileNumber || "",
      purokId: user.purokId || "",
      notifyEmail: !!user.notifyEmail,
      notifySms: !!user.notifySms,
      notifyPush: !!user.notifyPush,
    },
  });

  async function onSubmit(data: any) {
    setLoading(true);
    try {
      // Update basic profile fields
      const profileResult = await authClient.updateUser({
        name: data.name,
        // @ts-expect-error Better Auth additional fields
        mobileNumber: data.mobileNumber,
        purokId: data.purokId,
      });
      if (profileResult.error) {
        toast.error(profileResult.error.message ?? "Failed to update profile.");
        return;
      }

      // Update notification preferences
      const prefResult = await updateNotificationPreferences({
        notifyEmail: data.notifyEmail,
        notifySms: data.notifySms,
        notifyPush: data.notifyPush,
      });
      if (!prefResult.success) {
        toast.error("Failed to update notification preferences.");
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
        {errors.name && typeof errors.name.message === 'string' && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
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
        {errors.mobileNumber && typeof errors.mobileNumber.message === 'string' && (
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
        {errors.purokId && typeof errors.purokId.message === 'string' && <p className="mt-1.5 text-xs text-red-600">{errors.purokId.message}</p>}
      </div>

{/* Notification preferences */}
<div className="mt-4">
  <p className="text-sm font-medium mb-2">Notification Preferences</p>
  <label className="flex items-center space-x-2 mb-2">
    <input type="checkbox" {...register("notifyEmail")} defaultChecked={!!user.notifyEmail} />
    <span>Email</span>
  </label>
  <label className="flex items-center space-x-2 mb-2">
    <input type="checkbox" {...register("notifySms")} defaultChecked={!!user.notifySms} />
    <span>SMS</span>
  </label>
  <label className="flex items-center space-x-2">
    <input type="checkbox" {...register("notifyPush")} defaultChecked={!!user.notifyPush} />
    <span>Push</span>
  </label>
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
