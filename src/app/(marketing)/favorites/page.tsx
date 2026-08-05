'use client';

import { Heart } from 'lucide-react';
import { useCollections } from '@/store/collections';
import { useMounted } from '@/hooks/use-mounted';
import { useTranslation } from '@/i18n/context';
import { getPropertiesByIds } from '@/services/property-service';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { PropertyGrid } from '@/components/property/property-grid';
import { EmptyState } from '@/components/shared/empty-state';
import { PropertyCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const mounted = useMounted();
  const { t, isEs } = useTranslation();
  const favorites = useCollections((state) => state.favorites);
  const clearFavorites = useCollections((state) => state.clearFavorites);
  const items = getPropertiesByIds(favorites);

  return (
    <div className="container py-12">
      <Breadcrumb items={[{ label: t.favorites.title }]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline">{t.favorites.title}</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {t.favorites.subtitle}
          </p>
        </div>
        {mounted && items.length ? (
          <Button variant="outline" onClick={clearFavorites}>
            {isEs ? 'Limpiar todo' : 'Clear all'}
          </Button>
        ) : null}
      </div>

      <div className="mt-10">
        {!mounted ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : items.length ? (
          <PropertyGrid properties={items} />
        ) : (
          <EmptyState
            icon={<Heart className="size-8" />}
            title={t.favorites.emptyTitle}
            body={t.favorites.emptyBody}
            actionLabel={t.favorites.browseCatalogue}
            actionHref="/properties"
          />
        )}
      </div>
    </div>
  );
}
