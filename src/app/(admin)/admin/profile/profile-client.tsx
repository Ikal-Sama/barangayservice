"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, ShieldCheck, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

interface AdminProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminProfileClient({ user }: AdminProfileClientProps) {
  const router = useRouter();
  
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    
    setLoadingProfile(true);
    try {
      const result = await authClient.updateUser({
        name,
        // better-auth might update email if configure properly, or we fallback if it errors
      });
      
      if (result.error) {
        toast.error(result.error.message ?? "Failed to update profile.");
      } else {
        toast.success("Profile updated successfully.");
        router.refresh();
      }
    } catch {
      toast.error("An error occurred while updating profile.");
    } finally {
      setLoadingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoadingPassword(true);
    try {
      const result = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to change password.");
      } else {
        toast.success("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("An error occurred while changing password.");
    } finally {
      setLoadingPassword(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
      {/* Profile Details Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-100 text-cyan-600">
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-500">Update your basic profile details.</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-5" noValidate>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              For security reasons, changing the administrator email is disabled from the dashboard.
            </p>
          </div>

          <button
            type="submit"
            disabled={loadingProfile || (name === user.name && email === user.email)}
            className="w-full bg-slate-950 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loadingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Profile
          </button>
        </form>
      </div>

      {/* Security Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-100 text-purple-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Security & Password</h2>
            <p className="text-xs text-slate-500">Ensure your account stays secure.</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5" noValidate>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="currentPassword">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-slate-950 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loadingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
