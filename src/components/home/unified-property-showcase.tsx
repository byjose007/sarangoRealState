'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Property } from '@/types';
import { PropertyCard } from '@/components/property/property-card';
import { SectionHeading } from '@/components/shared/section-heading';
import { buttonVariants } from '@/components/ui/button';
import { useTranslation } from '@/i18n/context';
import { getPropertyTypeOptions } from '@/constants/navigation';
import { cn } from '@/lib/utils';

interface UnifiedPropertyShowcaseProps {
  properties: Property[];
  facets: {
    total: number;
    byType: Record<string, number>;
  };
}

const DISPLAY_LIMIT = 6;

export function UnifiedPropertyShowcase({ properties, facets }: UnifiedPropertyShowcaseProps) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<string>('all');

  const typeOptions = React.useMemo(() => getPropertyTypeOptions(t), [t]);

  // Count featured properties available in the pool
  const featuredCount = React.useMemo(
    () => properties.filter((p) => p.featured).length,
    [properties],
  );

  // Build the list of chips: "Todas", "Destacadas", and each property type with count > 0
  const chips = React.useMemo(() => {
    const list: Array<{
      id: string;
      label: string;
      count: number;
      isFeaturedTab?: boolean;
    }> = [
      {
        id: 'all',
        label: t.home.allProperties,
        count: facets.total,
      },
      {
        id: 'featured',
        label: t.home.featuredOnly,
        count: featuredCount,
        isFeaturedTab: true,
      },
    ];

    // Filter and sort available property types by count descending
    const activeTypes = typeOptions
      .map((option) => ({
        id: option.value,
        label: option.label,
        count: facets.byType[option.value] ?? 0,
        isFeaturedTab: false,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);

    return [...list, ...activeTypes];
  }, [t, facets, featuredCount, typeOptions]);

  // Filter and sort properties: featured always comes first
  const filteredProperties = React.useMemo(() => {
    let pool = properties;

    if (activeTab === 'featured') {
      pool = properties.filter((p) => p.featured);
    } else if (activeTab !== 'all') {
      pool = properties.filter((p) => p.type === activeTab);
    }

    // Strict priority: featured items first, then others
    const sorted = [...pool].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0; // preserve server secondary ordering (createdAt desc)
    });

    return sorted;
  }, [properties, activeTab]);

  const displayedItems = filteredProperties.slice(0, DISPLAY_LIMIT);

  // Active tab metadata for CTA button
  const currentChip = chips.find((c) => c.id === activeTab) ?? chips[0];
  const ctaHref =
    activeTab === 'all'
      ? '/properties'
      : activeTab === 'featured'
        ? '/properties?featured=true'
        : `/properties?types=${activeTab}`;

  const ctaLabel =
    activeTab === 'all'
      ? `${t.home.viewAllInCatalog} (${facets.total})`
      : activeTab === 'featured'
        ? `${t.home.featuredOnly} (${currentChip?.count ?? 0})`
        : `${t.home.viewMoreInCategory} · ${currentChip?.label} (${currentChip?.count ?? 0})`;

  return (
    <section className="border-y border-border/40 bg-surface/50 py-20 lg:py-28">
      <div className="container">
        {/* Section Header */}
        <SectionHeading
          eyebrow={t.home.showcaseEyebrow}
          title={t.home.showcaseTitle}
          lede={t.home.showcaseSubtitle}
          action={
            <Link href="/properties" className={buttonVariants({ variant: 'outline' })}>
              {t.home.viewAll} <ArrowRight className="size-4" />
            </Link>
          }
        />

        {/* Filter Chips Bar */}
        <div className="mt-10">
          <div
            role="tablist"
            aria-label={t.home.showcaseTitle}
            className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-3 pt-1 sm:flex-wrap"
          >
            {chips.map((chip) => {
              const isActive = activeTab === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(chip.id)}
                  className={cn(
                    'relative inline-flex shrink-0 select-none items-center gap-2 rounded-full px-4 py-2 text-xs font-medium tracking-tight transition-all duration-300',
                    isActive
                      ? 'bg-foreground text-background shadow-sm'
                      : 'border border-border/70 bg-card text-muted-foreground hover:border-foreground/20 hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  {chip.isFeaturedTab ? (
                    <Sparkles
                      className={cn('size-3.5', isActive ? 'text-brass' : 'text-brass/70')}
                    />
                  ) : null}
                  <span>{chip.label}</span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 font-mono text-[0.62rem] leading-none',
                      isActive
                        ? 'bg-background/20 text-background'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Properties Grid with Animated Transition */}
        <div className="mt-8 min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {displayedItems.length > 0 ? (
                displayedItems.map((property, idx) => (
                  <PropertyCard key={property.id} property={property} priority={idx < 3} />
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-border py-16 text-center">
                  <p className="font-display text-lg text-muted-foreground">
                    {language === 'es'
                      ? 'No hay propiedades disponibles en esta categoría en este momento.'
                      : 'No properties available in this category at the moment.'}
                  </p>
                  <Link
                    href="/properties"
                    className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
                  >
                    {t.home.viewAllInCatalog}
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Contextual CTA */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-border/50 pt-8 sm:flex-row sm:justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {filteredProperties.length > DISPLAY_LIMIT
              ? language === 'es'
                ? `Mostrando 6 de ${currentChip?.count ?? filteredProperties.length} propiedades`
                : `Showing 6 of ${currentChip?.count ?? filteredProperties.length} properties`
              : language === 'es'
                ? `${filteredProperties.length} propiedades mostradas`
                : `${filteredProperties.length} properties shown`}
          </p>

          <Link
            href={ctaHref}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full gap-2 transition-colors hover:bg-foreground hover:text-background sm:w-auto',
            )}
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
