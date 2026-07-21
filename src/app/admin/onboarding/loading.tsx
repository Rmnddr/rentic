import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <header>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
      </header>

      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
