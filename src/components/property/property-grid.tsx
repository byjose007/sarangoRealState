import type { Property } from '@/types';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/shared/reveal';
import { PropertyCard } from './property-card';

export function PropertyGrid({
  properties,
  layout = 'grid',
  className,
}: {
  properties: Property[];
  layout?: 'grid' | 'list';
  className?: string;
}) {
  return (
    <div
      className={cn(
        layout === 'grid' ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-5',
        className,
      )}
    >
      {properties.map((property, index) => (
        <Reveal key={property.id} delay={Math.min(index, 5) * 0.06}>
          <PropertyCard property={property} layout={layout} priority={index < 3} />
        </Reveal>
      ))}
    </div>
  );
}
