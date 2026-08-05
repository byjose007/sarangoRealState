'use client';

import { Scale } from 'lucide-react';
import { toast } from 'sonner';
import { MAX_COMPARE, useCollections } from '@/store/collections';
import { useMounted } from '@/hooks/use-mounted';
import { useTranslation } from '@/i18n/context';
import { cn } from '@/lib/utils';

export function CompareButton({
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
  const compare = useCollections((state) => state.compare);
  const toggleCompare = useCollections((state) => state.toggleCompare);
  const active = mounted && compare.includes(propertyId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Quitar ${title} de comparación` : `Añadir ${title} a comparación`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const result = toggleCompare(propertyId);
        if (result === 'full') {
          toast.error(
            isEs ? `Máximo ${MAX_COMPARE} propiedades a la vez` : `Comparison holds ${MAX_COMPARE} homes`,
            { description: isEs ? 'Elimina una propiedad para añadir otra.' : 'Remove one before adding another.' },
          );
          return;
        }
        toast.success(
          result === 'added'
            ? isEs ? 'Añadido a comparación' : 'Added to comparison'
            : isEs ? 'Eliminado de comparación' : 'Removed from comparison',
          { description: title },
        );
      }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full transition-colors',
        withLabel ? 'h-11 border border-border px-5 text-sm hover:bg-muted' : 'grid h-9 w-9 place-items-center glass',
        active && 'border-primary text-primary',
        className,
      )}
    >
      <Scale className="size-4" />
      {withLabel ? (active ? t.property.comparing : t.property.compare) : null}
    </button>
  );
}
