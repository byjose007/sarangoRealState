import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          className={cn(
            'size-3.5',
            step <= Math.round(value) ? 'fill-brass text-brass' : 'text-border',
          )}
        />
      ))}
    </div>
  );
}
