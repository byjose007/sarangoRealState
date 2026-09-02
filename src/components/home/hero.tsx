'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Ruler } from 'lucide-react';
import { cities } from '@/data/reference';
import { unsplash } from '@/data/images';
import { useTranslation } from '@/i18n/context';
import { SmartImage } from '@/components/shared/smart-image';
import { Button } from '@/components/ui/button';
import { HeroSearch } from './hero-search';

export function Hero() {
  const { t, isEs } = useTranslation();

  const facts = React.useMemo(
    () => [
      ['4.200', t.hero.surveyedListings],
      ['24', t.hero.avgDaysOnMarket],
      ['99,4%', t.hero.clientSatisfaction],
    ],
    [t],
  );

  return (
    <section className="relative overflow-hidden pt-10 lg:pt-16">
      <div className="container">
        <div className="grid items-end gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="eyebrow"
            >
              {isEs
                ? 'Inmobiliaria de precisión · est. 2009'
                : 'Survey-first brokerage · est. 2009'}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="balance mt-6 text-display"
            >
              {t.hero.titleLine1}
              <span className="block italic text-primary">{t.hero.titleLine2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="balance mt-6 max-w-lg text-muted-foreground"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/properties">
                <Button size="lg">
                  {t.home.ctaSecondary} <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  {isEs ? 'Cómo trabajamos' : 'How a survey works'}
                </Button>
              </Link>
            </motion.div>

            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-border pt-6">
              {facts.map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl tracking-tight">{value}</dt>
                  <dd className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Lead photograph with surveyor's annotation — the signature device */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="tick-frame relative aspect-[4/5] overflow-hidden rounded-xl sm:aspect-[5/4] lg:aspect-[4/5]"
          >
            <SmartImage
              src={unsplash(2, 1200, 1500)}
              alt="A surveyed residence at dusk"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              fallbackSeed="hero"
            />

            <svg
              className="pointer-events-none absolute inset-0 h-full w-full text-brass"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="8" y1="86" x2="92" y2="86" stroke="currentColor" strokeWidth="0.3" />
              <line x1="8" y1="83" x2="8" y2="89" stroke="currentColor" strokeWidth="0.3" />
              <line x1="92" y1="83" x2="92" y2="89" stroke="currentColor" strokeWidth="0.3" />
            </svg>

            <span className="absolute bottom-[7%] left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em]">
              <Ruler className="mr-1.5 inline size-3 text-brass" />
              {isEs ? 'fachada 21.4 m' : 'frontage 21.4 m'}
            </span>

            <span className="absolute left-5 top-5 rounded-full bg-background/90 px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em]">
              VS-001-AZUAY · Cuenca
            </span>
          </motion.div>
        </div>

        <HeroSearch className="relative z-20 mt-12 lg:-mt-6" />
      </div>

      {/* City marquee doubles as a shortcut row */}
      <div className="mt-14 overflow-hidden border-y border-border py-4">
        <div className="flex w-max animate-marquee gap-10 pr-10">
          {[...cities, ...cities].map((city, index) => (
            <Link
              key={`${city.slug}-${index}`}
              href={`/properties?city=${city.slug}`}
              className="inline-flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="size-1 rounded-full bg-brass" />
              {city.name}, {city.state}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
