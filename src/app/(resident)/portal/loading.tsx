import { DashboardSkeleton } from "@/components/loading-skeletons";

export default function Loading() {
  return (
    <main className="min-h-screen bg-app-grid pb-safe-bottom text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <DashboardSkeleton />
      </div>
    </main>
  );
}
