'use client';

import { partners } from '@/data/reference';
import { useTranslation } from '@/i18n/context';

export function Partners() {
  const { t } = useTranslation();

  return (
    <section className="border-y border-border py-10">
      <div className="container">
        <p className="text-center font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          {t.home.partnersLabel}
        </p>
        <div className="mask-fade-r mt-6 overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-14 pr-14">
            {[...partners, ...partners].map((partner, index) => (
              <span
                key={`${partner}-${index}`}
                className="whitespace-nowrap font-display text-xl tracking-tight text-muted-foreground/70"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
