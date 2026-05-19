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

export function FormPageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="glass-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-7 w-48" />
            <SkeletonBlock className="h-4 w-72" />
          </div>
          <SkeletonBlock className="h-11 w-11 rounded-2xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonBlock className="h-12 rounded-xl" />
          <SkeletonBlock className="h-12 rounded-xl" />
          <SkeletonBlock className="h-12 rounded-xl sm:col-span-2" />
          <SkeletonBlock className="h-28 rounded-xl sm:col-span-2" />
        </div>
      </div>
      <ListPanelSkeleton rows={3} />
    </div>
  );
}
