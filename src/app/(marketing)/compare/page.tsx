'use client';

import * as React from 'react';
import Link from 'next/link';
import { Scale, X } from 'lucide-react';
import type { Property } from '@/types';
import { useCollections } from '@/store/collections';
import { useMounted } from '@/hooks/use-mounted';
import { useTranslation } from '@/i18n/context';
import { getAgentsByIdsAction, getPropertiesByIdsAction } from '@/actions/public-catalog';
import { amenities } from '@/data/reference';
import { formatArea, formatListingPrice, formatNumber, formatPrice, getStatusLabel, getTypeLabel } from '@/lib/format';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { SmartImage } from '@/components/shared/smart-image';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { PropertyCardSkeleton } from '@/components/ui/skeleton';

export default function ComparePage() {
  const mounted = useMounted();
  const { language, t, isEs } = useTranslation();
  const compare = useCollections((state) => state.compare);
  const toggleCompare = useCollections((state) => state.toggleCompare);
  const clearCompare = useCollections((state) => state.clearCompare);
  const compareKey = compare.join(',');
  const [items, setItems] = React.useState<Property[]>([]);
  const [agentNames, setAgentNames] = React.useState<Record<string, string>>({});
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!compare.length) {
      setItems([]);
      setLoaded(true);
      return;
    }
    let active = true;
    getPropertiesByIdsAction(compare).then(async (result) => {
      if (!active) return;
      setItems(result);
      setLoaded(true);
      const agentIds = Array.from(new Set(result.map((property) => property.agentId)));
      const agents = await getAgentsByIdsAction(agentIds);
      if (active) setAgentNames(Object.fromEntries(agents.map((agent) => [agent.id, agent.name])));
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareKey]);

  const rows: [string, (index: number) => string][] = React.useMemo(
    () => [
      [t.property.price, (index) => formatListingPrice(items[index]!.price, items[index]!.pricePeriod, language)],
      [isEs ? 'Precio por m²' : 'Price per sq ft', (index) => formatPrice(Math.round(items[index]!.price / Math.max(items[index]!.area, 1)))],
      [t.propertyDetail.type, (index) => getStatusLabel(items[index]!.status, language)],
      [t.propertyDetail.reference, (index) => getTypeLabel(items[index]!.type, language)],
      [t.property.bedrooms, (index) => String(items[index]!.bedrooms || '—')],
      [t.property.bathrooms, (index) => String(items[index]!.bathrooms)],
      [t.propertyDetail.floorArea, (index) => formatArea(items[index]!.area, language)],
      [t.propertyDetail.land, (index) => (items[index]!.landArea ? formatArea(items[index]!.landArea, language) : '—')],
      [t.propertyDetail.garages, (index) => String(items[index]!.garages || '—')],
      [t.propertyDetail.yearBuilt, (index) => String(items[index]!.yearBuilt)],
      [t.propertyDetail.energyRating, (index) => items[index]!.energyRating],
      [t.propertyDetail.propertyTax, (index) => (items[index]!.propertyTax ? formatPrice(items[index]!.propertyTax) : '—')],
      [t.propertyDetail.hoaFee, (index) => (items[index]!.hoaFee ? formatPrice(items[index]!.hoaFee) : (isEs ? 'Ninguna' : 'None'))],
      [t.propertyDetail.viewsThisMonth, (index) => formatNumber(items[index]!.views)],
      [isEs ? 'Agente' : 'Agent', (index) => agentNames[items[index]!.agentId] ?? '—'],
      [
        t.propertyDetail.amenitiesTab,
        (index) => `${items[index]!.amenityIds.length} ${isEs ? 'de' : 'of'} ${amenities.length}`,
      ],
    ],
    [t, language, isEs, items, agentNames],
  );

  return (
    <div className="container py-12">
      <Breadcrumb items={[{ label: t.compare.title }]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline">{t.compare.title}</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {t.compare.subtitle}
          </p>
        </div>
        {mounted && items.length ? (
          <Button variant="outline" onClick={clearCompare}>
            {t.compare.clear}
          </Button>
        ) : null}
      </div>

      <div className="mt-10">
        {!mounted || !loaded ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : !items.length ? (
          <EmptyState
            icon={<Scale className="size-8" />}
            title={t.compare.emptyTitle}
            body={t.compare.emptyBody}
            actionLabel={t.favorites.browseCatalogue}
            actionHref="/properties"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse">
              <thead>
                <tr>
                  <th className="w-40 border-b border-border p-3 text-left align-bottom font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {t.compare.spec}
                  </th>
                  {items.map((property) => (
                    <th key={property.id} className="border-b border-border p-3 text-left align-bottom">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                        <SmartImage
                          src={property.images[0] as string}
                          alt={property.title}
                          fill
                          sizes="240px"
                          fallbackSeed={property.id}
                        />
                        <button
                          type="button"
                          onClick={() => toggleCompare(property.id)}
                          aria-label={`Remove ${property.title}`}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-foreground/80 text-background"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <Link
                        href={`/properties/${property.slug}`}
                        className="mt-3 block font-display text-base leading-tight hover:text-primary"
                      >
                        {property.title}
                      </Link>
                      <span className="mt-1 block font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
                        {property.reference}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, render]) => (
                  <tr key={label} className="odd:bg-muted/40">
                    <th scope="row" className="p-3 text-left text-sm font-normal text-muted-foreground">
                      {label}
                    </th>
                    {items.map((property, index) => (
                      <td key={property.id} className="p-3 font-mono text-sm">
                        {render(index)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
