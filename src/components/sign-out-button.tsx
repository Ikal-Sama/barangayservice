"use client";

import { logout } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SignOutButton({
  className = "",
}: {
  className?: string;
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

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl p-2 text-xs font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-60 tap-highlight-none ${className}`}
      aria-label="Sign out"
    >
      {isSigningOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {isSigningOut ? "Signing out" : "Sign out"}
      </span>
    </button>
  );
}
