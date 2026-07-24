import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-lg space-y-6 rounded-xl shadow-organic p-8">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-2/3" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
