function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

function ScheduleCardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-14" />
          <SkeletonBlock className="h-5 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-11 w-11 rounded-xl" />
          <SkeletonBlock className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <SkeletonBlock className="h-2.5 w-2.5 rounded-full" />
        <SkeletonBlock className="h-6 w-36" />
      </div>

      <div className="mb-4 flex gap-1.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-1.5 flex-1 rounded-full" />
        ))}
      </div>

      <SkeletonBlock className="mb-3 h-4 w-3/4" />
      <SkeletonBlock className="h-12 w-full rounded-xl" />
    </div>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-8 w-8 rounded-xl" />
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-5 w-5 rounded" />
              <SkeletonBlock className="h-5 w-32" />
            </div>
          </div>
          <SkeletonBlock className="h-10 w-32 rounded-xl" />
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-5 px-4 pb-12 pt-5">
        <SkeletonBlock className="h-5 w-80 max-w-full" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ScheduleCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
