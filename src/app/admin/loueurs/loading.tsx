import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <header>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </header>

      <Skeleton className="h-96 rounded-xl" />
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
    </div>
  );
}
