'use client';

import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { unsplash } from '@/data/images';
import { siteConfig } from '@/constants/site';
import { useTranslation } from '@/i18n/context';
import { SmartImage } from '@/components/shared/smart-image';
import { buttonVariants } from '@/components/ui/button';

export function CallToAction() {
  const { t, isEs } = useTranslation();

  return (
    <section className="container py-20 lg:py-28">
      <div className="tick-frame relative overflow-hidden rounded-xl">
        <SmartImage
          src={unsplash(20, 1600, 800)}
          alt=""
          fill
          sizes="100vw"
          fallbackSeed="cta"
          className="scale-105"
        />
        <div className="absolute inset-0 bg-foreground/72" />
        <div className="relative px-6 py-20 text-center text-background lg:px-16 lg:py-28">
          <span className="eyebrow justify-center text-background/70 before:bg-brass">
            {isEs ? 'Listos cuando tú lo estés' : 'Ready when you are'}
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl text-headline balance">
            {t.home.ctaTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-background/75">
            {t.home.ctaSubtitle}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className={buttonVariants({ size: 'lg', variant: 'brass' })}>
              {t.home.ctaButton} <ArrowRight className="size-4" />
            </Link>
            <a
              href={`tel:${siteConfig.phone}`}
              className={buttonVariants({
                size: 'lg',
                variant: 'outline',
                className: 'border-background/40 text-background hover:bg-background/10',
              })}
            >
              <Phone className="size-4" /> {siteConfig.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
