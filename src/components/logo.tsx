import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function Logo({ className = "h-10 w-10", iconOnly = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src="/logo.png"
          alt="BarangayLink Logo"
          className={className}
        />
      </div>
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-black tracking-tight text-slate-950">
            Barangay<span className="text-sky-500">Link</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
            Connected Community
          </span>
        </div>
      )}
    </div>
  );
}
