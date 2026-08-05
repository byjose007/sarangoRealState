import { Suspense } from 'react';
import { buildMetadata } from '@/lib/seo';
import { PropertyExplorer } from '@/features/property-search/property-explorer';
import { PropertyCardSkeleton } from '@/components/ui/skeleton';
import { getFacets } from '@/services/property-service';
import { PropertiesPageHeader } from '@/components/property/property-page-header';

export const metadata = buildMetadata({
  title: 'Homes for sale and rent',
  description:
    'Filter 100 surveyed listings by city, type, price, floor area and amenities. Grid, list and plan views.',
  path: '/properties',
});

export default function PropertiesPage() {
  const facets = getFacets();

  return (
    <>
      <PropertiesPageHeader total={facets.total} />

      <Suspense
        fallback={
          <div className="container grid gap-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <PropertyExplorer />
      </Suspense>
    </>
  );
}
