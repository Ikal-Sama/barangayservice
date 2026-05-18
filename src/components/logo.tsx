import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function Logo({ className = "h-9 w-9", iconOnly = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            {/* Smooth Premium Gradients */}
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
              <stop offset="100%" stopColor="#0ea5e9" /> {/* sky-500 */}
            </linearGradient>
            <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" /> {/* slate-900 / Deep Blackish */}
              <stop offset="100%" stopColor="#1e293b" /> {/* slate-800 */}
            </linearGradient>
            
            {/* Drop Shadow for the interlocking sky-blue link */}
            <filter id="linkShadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0ea5e9" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Strong foundation pillar (Barangay - represents slate-900 / Black) */}
          <rect
            x="24"
            y="20"
            width="16"
            height="60"
            rx="8"
            fill="url(#darkGradient)"
          />

          {/* Upper node on the pillar */}
          <circle cx="32" cy="28" r="4" fill="#ffffff" />

          {/* Sky-Blue dynamic connecting loop (Link - represents connection & digital bridge) */}
          <path
            d="M32 36C46.3594 36 58 47.6406 58 62C58 70.3333 53 76 44 76C36 76 36 68 44 68C49 68 50 64 50 62C50 52.0589 41.9411 44 32 44C27.5817 44 24 40.4183 24 36Z"
            fill="url(#skyGradient)"
            filter="url(#linkShadow)"
          />

          {/* Main interconnected outer ring (Sky Blue / White accents) */}
          <path
            d="M48 24C63.464 24 76 36.536 76 52C76 56.4183 72.4183 60 68 60C63.5817 60 60 56.4183 60 52C60 45.3726 54.6274 40 48 40C43.5817 40 40 36.4183 40 32C40 27.5817 43.5817 24 48 24Z"
            fill="url(#skyGradient)"
          />

          {/* Central intersecting pulse core (White - representing the resident at the heart) */}
          <circle cx="48" cy="52" r="7" fill="#ffffff" />
          <circle cx="48" cy="52" r="3" fill="#0ea5e9" />
        </svg>
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
