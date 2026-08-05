'use client';

import * as React from 'react';
import { LayoutGrid, Map as MapIcon, Rows3, SlidersHorizontal } from 'lucide-react';
import { searchAll, searchProperties } from '@/services/property-service';
import { getSortOptions } from '@/constants/navigation';
import { PER_PAGE } from '@/constants/site';
import { useTranslation } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { Drawer } from '@/components/ui/drawer';
import { Pagination } from '@/components/ui/pagination';
import { PropertyCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { PropertyGrid } from '@/components/property/property-grid';
import { PropertyMap } from '@/components/property/property-map';
import { toMapPoint } from '@/lib/map';
import { FilterSidebar } from './filter-sidebar';
import { usePropertyFilters } from './use-property-filters';

/**
 * Listing shell. Reads state from the URL, runs it through the property
 * service, and swaps between grid, list and map without losing the query.
 */
export function PropertyExplorer() {
  const { filters, view, write, activeCount, reset } = usePropertyFilters();
  const { t, isEs } = useTranslation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const key = JSON.stringify(filters);
  const debouncedKey = useDebounce(key, 220);

  const sortOptions = React.useMemo(() => getSortOptions(t), [t]);

  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 260);
    return () => clearTimeout(timer);
  }, [debouncedKey]);

  const result = React.useMemo(
    () => searchProperties({ ...filters, perPage: PER_PAGE }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedKey],
  );
  const mapItems = React.useMemo(
    () => searchAll(filters).slice(0, 40),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedKey],
  );

  const views: { value: 'grid' | 'list' | 'map'; icon: typeof LayoutGrid; label: string }[] = [
    { value: 'grid', icon: LayoutGrid, label: isEs ? 'Cuadrícula' : 'Grid' },
    { value: 'list', icon: Rows3, label: isEs ? 'Lista' : 'List' },
    { value: 'map', icon: MapIcon, label: isEs ? 'Mapa' : 'Map' },
  ];

  return (
    <div className="container grid gap-10 py-10 lg:grid-cols-[17rem_1fr] lg:py-14">
      <FilterSidebar className="hidden lg:block" />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="font-mono text-eyebrow uppercase text-muted-foreground">{t.explorer.results}</p>
            <p className="mt-1 font-display text-2xl tracking-tight">
              {result.total} {result.total === 1 ? t.explorer.home : t.explorer.homes}
              {activeCount ? (
                <button
                  type="button"
                  onClick={reset}
                  className="ml-3 align-middle font-sans text-xs text-primary hover:underline"
                >
                  {isEs ? `limpiar ${activeCount} filtro(s)` : `clear ${activeCount} filter(s)`}
                </button>
              ) : null}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawerOpen(true)}>
              <SlidersHorizontal className="size-4" /> {t.explorer.filters}
            </Button>

            <div className="flex rounded-full border border-border p-1">
              {views.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-label={`${item.label} view`}
                  aria-pressed={view === item.value}
                  onClick={() => write({ view: item.value }, false)}
                  className={cn(
                    'grid h-8 w-9 place-items-center rounded-full transition-colors',
                    view === item.value ? 'bg-foreground text-background' : 'hover:bg-muted',
                  )}
                >
                  <item.icon className="size-4" />
                </button>
              ))}
            </div>

            <Select
              aria-label={t.property.sortBy}
              value={filters.sort}
              onChange={(event) => write({ sort: event.target.value })}
              className="h-9 w-44 text-xs"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="pt-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : result.total === 0 ? (
            <EmptyState
              title={t.explorer.emptyTitle}
              body={t.explorer.emptyBody}
              actionLabel={t.explorer.clearAllFilters}
              actionHref="/properties"
            />
          ) : view === 'map' ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
              <PropertyMap points={mapItems.map(toMapPoint)} className="h-[34rem] lg:sticky lg:top-28" />
              <div className="flex max-h-[34rem] flex-col gap-4 overflow-y-auto pr-1">
                <PropertyGrid properties={result.items} layout="list" />
              </div>
            </div>
          ) : (
            <PropertyGrid properties={result.items} layout={view === 'list' ? 'list' : 'grid'} />
          )}
        </div>

        {!loading && result.totalPages > 1 ? (
          <div className="mt-12">
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              onChange={(page) => {
                write({ page }, false);
                window.scrollTo({ top: 240, behavior: 'smooth' });
              }}
            />
          </div>
        ) : null}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} side="left" title={t.explorer.filters}>
        <div className="p-5">
          <FilterSidebar />
          <Button className="mt-6 w-full" onClick={() => setDrawerOpen(false)}>
            {isEs ? `Ver ${result.total} viviendas` : `Show ${result.total} homes`}
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
