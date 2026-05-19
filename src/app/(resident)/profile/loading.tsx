import { ProfileSkeleton } from "@/components/loading-skeletons";

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <ProfileSkeleton />
    </main>
  );
}
