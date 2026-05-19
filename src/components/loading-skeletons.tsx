function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-6 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.9)] lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <SkeletonBlock className="h-7 w-44 bg-white/15" />
            <SkeletonBlock className="h-12 w-full max-w-xl bg-white/15" />
            <SkeletonBlock className="h-5 w-full max-w-lg bg-white/10" />
            <SkeletonBlock className="h-5 w-2/3 bg-white/10" />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <SkeletonBlock className="h-4 w-32 bg-white/15" />
                <SkeletonBlock className="h-7 w-40 bg-white/15" />
              </div>
              <SkeletonBlock className="h-12 w-12 rounded-2xl bg-white/15" />
            </div>
            <SkeletonBlock className="mt-8 h-10 w-48 bg-white/15" />
            <SkeletonBlock className="mt-4 h-16 w-full rounded-2xl bg-white/10" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-card p-5">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-11 w-11 rounded-2xl" />
              <SkeletonBlock className="h-6 w-16 rounded-full" />
            </div>
            <SkeletonBlock className="mt-5 h-9 w-20" />
            <SkeletonBlock className="mt-3 h-4 w-28" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <ListPanelSkeleton rows={4} />
        <ListPanelSkeleton rows={5} compact />
      </section>
    </div>
  );
}

export function ListPanelSkeleton({
  rows = 6,
  compact = false,
}: {
  rows?: number;
  compact?: boolean;
}) {
  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-5 w-44" />
          <SkeletonBlock className="h-4 w-60" />
        </div>
        <SkeletonBlock className="h-9 w-9 rounded-2xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-2/3" />
                <SkeletonBlock className="h-3 w-full" />
                {!compact && <SkeletonBlock className="h-3 w-1/2" />}
              </div>
              <SkeletonBlock className="h-7 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RequestCardSkeleton() {
  return (
    <div className="w-full max-w-sm rounded-[2rem] border border-white bg-white/60 p-6 shadow-sm backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        {/* Status Pill (READY FOR PICKUP) */}
        <SkeletonBlock className="h-6 w-32 rounded-full" />
        {/* Timestamp (1d ago) */}
        <SkeletonBlock className="h-4 w-12 rounded" />
      </div>

      <div className="mb-6 space-y-3">
        {/* Document Title (Barangay Clearance) */}
        <SkeletonBlock className="h-6 w-48 rounded" />
        {/* Subtitle (For Employment) */}
        <SkeletonBlock className="h-4 w-32 rounded" />
      </div>

      {/* Admin Note Box */}
      <div className="rounded-2xl bg-slate-50/50 p-4 space-y-2">
        <SkeletonBlock className="h-3 w-20 rounded" /> {/* ADMIN NOTE: label */}
        <SkeletonBlock className="h-4 w-full rounded" /> {/* Note content line 1 */}
        <SkeletonBlock className="h-4 w-2/3 rounded" /> {/* Note content line 2 */}
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-8 w-40 rounded-lg" /> {/* "Your Requests" */}
        <SkeletonBlock className="h-10 w-44 rounded-full" /> {/* "+ Request Document" button */}
      </div>

      {/* Grid of Request Cards */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <RequestCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function IncidentReportSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {/* "Your Incident Reports" Title */}
          <SkeletonBlock className="h-8 w-64 rounded-lg" />
          {/* "Submit neighborhood issues..." Subtitle */}
          <SkeletonBlock className="h-4 w-full max-w-md rounded" />
        </div>
        {/* "+ File a Report" Black Button */}
        <SkeletonBlock className="h-12 w-40 rounded-2xl bg-slate-900/20" />
      </div>

      {/* The Large Empty State / Content Panel */}
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[3rem] border border-white bg-white/60 p-8 shadow-sm backdrop-blur-sm">
        {/* Icon Placeholder (The inbox/folder icon) */}
        <SkeletonBlock className="mb-6 h-16 w-16 rounded-2xl bg-slate-100" />

        {/* "No reports filed yet" Text */}
        <SkeletonBlock className="mb-3 h-6 w-48 rounded" />

        {/* Description Text Lines */}
        <div className="flex flex-col items-center space-y-2">
          <SkeletonBlock className="h-4 w-80 rounded" />
          <SkeletonBlock className="h-4 w-60 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      {/* Main Profile Card */}
      <div className="w-full max-w-xl rounded-[2.5rem] bg-white p-8 shadow-xl sm:p-12">
        <div className="space-y-8">

          {/* Form Groups (Repeated for each field) */}
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3">
              {/* Field Label (e.g., EMAIL ADDRESS) */}
              <SkeletonBlock className="h-3 w-32 rounded bg-slate-100" />

              {/* Input Field */}
              <SkeletonBlock className="h-14 w-full rounded-2xl border border-slate-50" />

              {/* Helper text for the first item (Email Address cannot be changed) */}
              {index === 0 && (
                <SkeletonBlock className="h-3 w-48 rounded bg-slate-50" />
              )}
            </div>
          ))}

          {/* "Save Changes" Button */}
          <div className="pt-4">
            <SkeletonBlock className="h-14 w-full rounded-2xl bg-slate-400/30" />
          </div>
        </div>
      </div>
    </div>
  );
}


