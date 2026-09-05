'use client';

import Link from 'next/link';
import { Eye, MapPin } from 'lucide-react';
import type { Property } from '@/types';
import { formatListingPrice, getStatusLabel, getTypeLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useUi } from '@/store/ui-store';
import { useTranslation } from '@/i18n/context';
import { SmartImage } from '@/components/shared/smart-image';
import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from './favorite-button';
import { CompareButton } from './compare-button';
import { PropertySpecs } from './property-specs';

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
  className?: string;
  /** `list` renders the horizontal row used by the listing page. */
  layout?: 'grid' | 'list';
}

export function PropertyCard({
  property,
  priority,
  className,
  layout = 'grid',
}: PropertyCardProps) {
  const openQuickView = useUi((state) => state.openQuickView);
  const { language, isEs } = useTranslation();
  const isList = layout === 'list';

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 ease-entrance hover:-translate-y-1 hover:shadow-lift',
        isList && 'grid gap-0 hover:translate-y-0 sm:grid-cols-[minmax(0,22rem)_1fr]',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          isList ? 'aspect-[4/3] sm:aspect-auto' : 'aspect-[4/3]',
        )}
      >
        <SmartImage
          src={property.images[0] as string}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          fallbackSeed={property.id}
          className="transition-transform duration-700 ease-entrance group-hover:scale-[1.06]"
        />

        <div className="absolute left-4 top-4 flex gap-2">
          <Badge variant={property.status === 'for-rent' ? 'brass' : 'solid'}>
            {getStatusLabel(property.status, language)}
          </Badge>
          {property.featured ? (
            <Badge variant="brass" className="shadow-sm">
              <span className="text-[0.6rem]">★</span> {isEs ? 'Destacada' : 'Featured'}
            </Badge>
          ) : null}
        </div>

        <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover:opacity-100">
          <FavoriteButton propertyId={property.id} title={property.title} />
          <CompareButton propertyId={property.id} title={property.title} />
          <button
            type="button"
            aria-label={`Quick view ${property.title}`}
            onClick={() => openQuickView(property.id)}
            className="glass grid h-9 w-9 place-items-center rounded-full transition-colors"
          >
            <Eye className="size-4" />
          </button>
        </div>

        {/* Signature: surveyor's annotation over the photograph */}
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between">
          <span className="rounded-full bg-foreground/75 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-background backdrop-blur-sm">
            {property.reference}
          </span>
          <span className="rounded-full bg-foreground/75 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-background backdrop-blur-sm">
            {getTypeLabel(property.type, language)}
          </span>
        </div>
      </div>

      <div className={cn('flex flex-col p-5', isList && 'justify-between p-6')}>
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-mono text-lg tracking-tight text-foreground">
              {formatListingPrice(property.price, property.pricePeriod, language)}
            </p>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
              {property.energyRating} · {property.yearBuilt}
            </span>
          </div>

          <h3 className="mt-2 font-display text-xl leading-tight tracking-tight">
            <Link href={`/properties/${property.slug}`} className="after:absolute after:inset-0">
              {property.title}
            </Link>
          </h3>

          <p className="mt-1.5 inline-flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-brass" />
            {property.address}
          </p>

          {isList ? (
            <p className="mt-3 line-clamp-2 max-w-xl text-sm text-muted-foreground">
              {property.description.split('\n\n')[0]}
            </p>
          ) : null}
        </div>

        <PropertySpecs property={property} className="mt-5 border-t border-border pt-4" />
      </div>
    </article>
  );
}
