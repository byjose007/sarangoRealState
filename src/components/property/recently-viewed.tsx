'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCollections } from '@/store/collections';
import { useMounted } from '@/hooks/use-mounted';
import { useTranslation } from '@/i18n/context';
import { getPropertiesByIds } from '@/services/property-service';
import { formatListingPrice } from '@/lib/format';
import { SmartImage } from '@/components/shared/smart-image';

/** Tracks the current listing and renders the visitor's own history. */
export function TrackView({ propertyId }: { propertyId: string }) {
  const pushRecent = useCollections((state) => state.pushRecent);
  React.useEffect(() => {
    pushRecent(propertyId);
  }, [propertyId, pushRecent]);
  return null;
}

export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const mounted = useMounted();
  const { language, t } = useTranslation();
  const recent = useCollections((state) => state.recent);
  const items = getPropertiesByIds(recent.filter((id) => id !== exclude)).slice(0, 4);

  if (!mounted || items.length < 2) return null;

  return (
    <section aria-label={t.home.recentlyViewed} className="border-t border-border py-12">
      <div className="container">
        <p className="font-mono text-eyebrow uppercase text-muted-foreground">{t.home.recentlyViewed}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.slug}`}
              className="group flex items-center gap-4 rounded-md border border-border p-3 transition-colors hover:bg-muted"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-sm">
                <SmartImage src={property.images[0] as string} alt="" fill sizes="64px" fallbackSeed={property.id} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-sm">{property.title}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {formatListingPrice(property.price, property.pricePeriod, language)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
