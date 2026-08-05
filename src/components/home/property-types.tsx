'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getPropertyTypeOptions } from '@/constants/navigation';
import { getFacets } from '@/services/property-service';
import { unsplash } from '@/data/images';
import { useTranslation } from '@/i18n/context';
import { SmartImage } from '@/components/shared/smart-image';
import { SectionHeading } from '@/components/shared/section-heading';
import { cn } from '@/lib/utils';

/** Hovering a type swaps the plate — a catalogue index, not a card grid. */
export function PropertyTypes() {
  const [active, setActive] = React.useState(0);
  const { t } = useTranslation();
  const facets = getFacets();
  const options = React.useMemo(() => getPropertyTypeOptions(t), [t]);

  return (
    <section className="container py-20 lg:py-28">
      <SectionHeading eyebrow={t.home.catalogueIndex} title={t.home.browseByWhat} />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <ul className="divide-y divide-border border-y border-border">
          {options.map((option, index) => (
            <li key={option.value}>
              <Link
                href={`/properties?types=${option.value}`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={cn(
                  'group flex items-center justify-between gap-6 px-2 py-5 transition-colors',
                  active === index && 'bg-muted/60',
                )}
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-[0.65rem] text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-2xl tracking-tight">{option.label}</span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {facets.byType[option.value] ?? 0} {t.home.listed}
                  </span>
                  <ArrowUpRight className="size-4 text-brass opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl lg:block">
          {options.map((option, index) => (
            <SmartImage
              key={option.value}
              src={unsplash(index * 4 + 1, 1000, 750)}
              alt={option.label}
              fill
              sizes="45vw"
              fallbackSeed={option.value}
              className={cn(
                'transition-opacity duration-500',
                active === index ? 'opacity-100' : 'opacity-0',
              )}
            />
          ))}
          <span className="absolute bottom-5 left-5 rounded-full bg-background/90 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.14em]">
            {options[active]?.label}
          </span>
        </div>
      </div>
    </section>
  );
}
