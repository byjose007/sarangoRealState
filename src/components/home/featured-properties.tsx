'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { featuredProperties } from '@/data/properties';
import { Carousel } from '@/components/ui/carousel';
import { PropertyCard } from '@/components/property/property-card';
import { SectionHeading } from '@/components/shared/section-heading';
import { buttonVariants } from '@/components/ui/button';
import { useTranslation } from '@/i18n/context';

export function FeaturedProperties() {
  const { t, isEs } = useTranslation();
  const items = featuredProperties.slice(0, 9);

  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="container">
        <SectionHeading
          eyebrow={isEs ? 'Destacadas este mes' : 'Featured this month'}
          title={t.home.featuredTitle}
          lede={t.home.featuredSubtitle}
          action={
            <Link href="/properties" className={buttonVariants({ variant: 'outline' })}>
              {t.home.viewAll} <ArrowRight className="size-4" />
            </Link>
          }
        />

        <Carousel className="mt-12" autoplay>
          {items.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
