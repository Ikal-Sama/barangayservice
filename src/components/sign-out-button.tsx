"use client";

import { logout } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SignOutButton({
  className = "",
  variant = "ghost",
}: {
  className?: string;
  variant?: "ghost" | "full";
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      const result = await logout();

      if (!result.success) {
        toast.error(result.error);
        setIsSigningOut(false);
        return;
      }

      toast.success(result.message);
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Unable to sign out. Please try again.");
      setIsSigningOut(false);
    }
  }

  const baseStyles =
    variant === "full"
      ? "w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs font-black text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all duration-200 disabled:pointer-events-none disabled:opacity-60 tap-highlight-none"
      : "inline-flex items-center justify-center gap-1.5 rounded-xl p-2 text-xs font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-60 tap-highlight-none";

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={`${baseStyles} ${className}`}
      aria-label="Sign out"
    >
      {isSigningOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span>
        {isSigningOut ? "Signing out" : "Sign out"}
      </span>
    </button>
  );
}
