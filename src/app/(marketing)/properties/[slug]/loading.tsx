import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container space-y-8 py-12">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-12 w-2/3" />
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <Skeleton className="aspect-[16/11]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
          <Skeleton className="aspect-[4/3]" />
          <Skeleton className="aspect-[4/3]" />
        </div>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_23rem]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
