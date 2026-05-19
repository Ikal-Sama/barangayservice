function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 ${className}`} />;
}

function ContactCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Left Icon Placeholder */}
        <SkeletonBlock className="h-12 w-12 rounded-xl" />

        <div className="space-y-2">
          {/* Title and Tag row */}
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-5 w-32 rounded" />
            <SkeletonBlock className="h-5 w-16 rounded-full" />
          </div>
          {/* Phone Number row */}
          <SkeletonBlock className="h-4 w-24 rounded" />
        </div>
      </div>

      {/* Action Buttons (Edit/Delete) */}
      <div className="flex gap-3">
        <SkeletonBlock className="h-5 w-5 rounded" />
        <SkeletonBlock className="h-5 w-5 rounded" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header matching the image */}
      <header className="sticky top-0 z-40 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-5 w-5 rounded" /> {/* Back arrow */}
            <SkeletonBlock className="h-6 w-48 rounded" /> {/* Title */}
          </div>
          <SkeletonBlock className="h-10 w-36 rounded-full" /> {/* Add Contact button */}
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-6 pt-8">
        {/* "ALL CONTACTS (4)" Label */}
        <SkeletonBlock className="h-4 w-32 rounded" />

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <ContactCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}