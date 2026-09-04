'use client';

import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { siteConfig } from '@/constants/site';
import { useTranslation } from '@/i18n/context';
import { SmartImage } from '@/components/shared/smart-image';
import { buttonVariants } from '@/components/ui/button';

export function CallToAction() {
  const { t, isEs } = useTranslation();

  return (
    <section className="container py-20 lg:py-28">
      <div className="tick-frame relative overflow-hidden rounded-2xl shadow-xl">
        <SmartImage
          src="/images/sarango-office.webp"
          alt="Oficinas Sarango Real Estate"
          fill
          quality={95}
          sizes="100vw"
          fallbackSeed="cta"
          className="object-cover object-center"
        />
        {/* Capa completa de oscurecimiento y sutil difuminado */}
        <div className="absolute inset-0 bg-neutral-950/65 backdrop-blur-[2px]" />

        <div className="relative px-6 py-20 text-center text-white lg:px-16 lg:py-28">
          <span className="eyebrow justify-center text-amber-200/90 before:bg-brass">
            {isEs ? 'Listos cuando tú lo estés' : 'Ready when you are'}
          </span>
          <h2 className="balance mx-auto mt-5 max-w-2xl text-headline font-medium text-white drop-shadow-md">
            {t.home.ctaTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/90 lg:text-lg">
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
                className: 'border-white/30 text-white backdrop-blur-sm hover:bg-white/10',
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
