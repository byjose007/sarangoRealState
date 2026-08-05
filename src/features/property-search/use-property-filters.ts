'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ListingStatus, PropertyFilters, PropertyType, SortKey, ViewMode } from '@/types';

const asNumber = (value: string | null) => (value ? Number(value) : undefined);
const asList = (value: string | null) => (value ? value.split(',').filter(Boolean) : undefined);

/** Filters live in the URL: shareable, bookmarkable, back-button friendly. */
export function usePropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters = React.useMemo<PropertyFilters>(
    () => ({
      q: params.get('q') ?? undefined,
      status: (params.get('status') as ListingStatus | 'all' | null) ?? 'all',
      types: asList(params.get('types')) as PropertyType[] | undefined,
      citySlug: params.get('city') ?? undefined,
      minPrice: asNumber(params.get('minPrice')),
      maxPrice: asNumber(params.get('maxPrice')),
      bedrooms: asNumber(params.get('beds')),
      bathrooms: asNumber(params.get('baths')),
      minArea: asNumber(params.get('minArea')),
      maxArea: asNumber(params.get('maxArea')),
      garages: asNumber(params.get('garages')),
      amenities: asList(params.get('amenities')),
      sort: (params.get('sort') as SortKey | null) ?? 'newest',
      page: asNumber(params.get('page')) ?? 1,
    }),
    [params],
  );

  const view = (params.get('view') as ViewMode | null) ?? 'grid';

  const write = React.useCallback(
    (next: Record<string, string | number | string[] | undefined | null>, resetPage = true) => {
      const search = new URLSearchParams(params.toString());
      Object.entries(next).forEach(([key, value]) => {
        const serialised = Array.isArray(value) ? value.join(',') : value == null ? '' : String(value);
        if (!serialised || serialised === 'all' || serialised === '0') search.delete(key);
        else search.set(key, serialised);
      });
      if (resetPage) search.delete('page');
      router.replace(`${pathname}?${search.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const reset = React.useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  const activeCount = [
    filters.q,
    filters.status !== 'all' ? filters.status : null,
    filters.types?.length ? 'types' : null,
    filters.citySlug,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.bathrooms,
    filters.minArea,
    filters.garages,
    filters.amenities?.length ? 'amenities' : null,
  ].filter(Boolean).length;

  return { filters, view, write, reset, activeCount };
}
