import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container space-y-6 py-20">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-16 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/3]" />
        ))}
      </div>
    </div>
  );
}
