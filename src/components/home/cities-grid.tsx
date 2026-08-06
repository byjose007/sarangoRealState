'use client';

import Link from 'next/link';
import { cities } from '@/data/reference';
import { useTranslation } from '@/i18n/context';
import { SmartImage } from '@/components/shared/smart-image';
import { SectionHeading } from '@/components/shared/section-heading';
import { Reveal } from '@/components/shared/reveal';

export function CitiesGrid({ byCity }: { byCity: Record<string, number> }) {
  const { t } = useTranslation();

  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="container">
        <SectionHeading
          eyebrow={t.home.whereWeSurvey}
          title={t.home.whereWeSurveyTitle}
          lede={t.home.whereWeSurveyLede}
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cities.map((city, index) => (
            <Reveal key={city.slug} delay={Math.min(index, 6) * 0.05}>
              <Link
                href={`/properties?city=${city.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-lg"
              >
                <SmartImage
                  src={city.image}
                  alt={city.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 20vw"
                  fallbackSeed={city.slug}
                  className="transition-transform duration-700 ease-entrance group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/10 to-transparent" />
                <span className="absolute inset-x-4 bottom-4 text-background">
                  <span className="block font-display text-xl tracking-tight">{city.name}</span>
                  <span className="mt-1 block font-mono text-[0.62rem] uppercase tracking-[0.14em] text-background/75">
                    {byCity[city.slug] ?? 0} {t.home.listingsCount} · {city.state}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
