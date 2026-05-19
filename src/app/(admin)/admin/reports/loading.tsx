import { ListPanelSkeleton } from "@/components/loading-skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl">
      <ListPanelSkeleton rows={6} />
    </div>
  );
}
