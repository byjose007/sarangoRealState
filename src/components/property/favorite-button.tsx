'use client';

import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useCollections } from '@/store/collections';
import { useMounted } from '@/hooks/use-mounted';
import { useTranslation } from '@/i18n/context';
import { cn } from '@/lib/utils';

export function FavoriteButton({
  propertyId,
  title,
  className,
  withLabel = false,
}: {
  propertyId: string;
  title: string;
  className?: string;
  withLabel?: boolean;
}) {
  const mounted = useMounted();
  const { t, isEs } = useTranslation();
  const favorites = useCollections((state) => state.favorites);
  const toggleFavorite = useCollections((state) => state.toggleFavorite);
  const active = mounted && favorites.includes(propertyId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Quitar ${title}` : `Guardar ${title}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(propertyId);
        toast[active ? 'message' : 'success'](
          active
            ? isEs ? 'Eliminado de viviendas guardadas' : 'Removed from saved homes'
            : isEs ? 'Guardado en favoritos' : 'Saved',
          { description: title },
        );
      }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full transition-colors',
        withLabel ? 'h-11 border border-border px-5 text-sm hover:bg-muted' : 'grid h-9 w-9 place-items-center glass',
        className,
      )}
    >
      <Heart className={cn('size-4 transition-all', active && 'fill-destructive text-destructive')} />
      {withLabel ? (active ? t.property.saved : t.property.save) : null}
    </button>
  );
}
