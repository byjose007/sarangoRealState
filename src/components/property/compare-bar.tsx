'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Property } from '@/types';
import { MAX_COMPARE, useCollections } from '@/store/collections';
import { useMounted } from '@/hooks/use-mounted';
import { useTranslation } from '@/i18n/context';
import { getPropertiesByIdsAction } from '@/actions/public-catalog';
import { SmartImage } from '@/components/shared/smart-image';
import { Button } from '@/components/ui/button';

/** Sticky tray that follows the comparison selection across the site. */
export function CompareBar() {
  const mounted = useMounted();
  const pathname = usePathname();
  const { t, isEs } = useTranslation();
  const compare = useCollections((state) => state.compare);
  const toggleCompare = useCollections((state) => state.toggleCompare);
  const clearCompare = useCollections((state) => state.clearCompare);
  const compareKey = compare.join(',');
  const [items, setItems] = React.useState<Property[]>([]);

  React.useEffect(() => {
    if (!compare.length) {
      setItems([]);
      return;
    }
    let active = true;
    getPropertiesByIdsAction(compare).then((result) => {
      if (active) setItems(result);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareKey]);

  const hidden = !mounted || !items.length || pathname === '/compare';

  return (
    <AnimatePresence>
      {hidden ? null : (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-3xl rounded-lg border border-border bg-surface p-3 shadow-lift sm:inset-x-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
              {items.map((property) => (
                <div key={property.id} className="relative h-14 w-20 shrink-0 overflow-hidden rounded-sm">
                  <SmartImage
                    src={property.images[0] as string}
                    alt={property.title}
                    fill
                    sizes="80px"
                    fallbackSeed={property.id}
                  />
                  <button
                    type="button"
                    onClick={() => toggleCompare(property.id)}
                    aria-label={`Remove ${property.title}`}
                    className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-foreground/80 text-background"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <span className="shrink-0 px-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                {items.length}/{MAX_COMPARE}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="hidden text-xs text-muted-foreground hover:text-foreground sm:block"
              >
                {isEs ? 'Limpiar' : 'Clear'}
              </button>
              <Link href="/compare">
                <Button size="sm">{t.property.compare}</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
