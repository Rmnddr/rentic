import { Skeleton } from "@/components/ui/skeleton";

export default function ReserverLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 h-9 w-2/3" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-1.5 flex-1 rounded-full" />
        ))}
      </div>
      <Skeleton className="mt-8 h-80 w-full rounded-lg" />
      <div className="mt-6 flex justify-end">
        <Skeleton className="h-9 w-28" />
      </div>
    </main>
  );
}
