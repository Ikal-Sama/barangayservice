import { FormPageSkeleton } from "@/components/loading-skeletons";

export default function Loading() {
  return (
    <main className="min-h-screen bg-app-grid px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <FormPageSkeleton />
    </main>
  );
}
