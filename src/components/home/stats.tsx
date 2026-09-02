'use client';

import { getCompanyStats } from '@/data/reference';
import { Counter } from '@/components/shared/counter';
import { Reveal } from '@/components/shared/reveal';
import { useTranslation } from '@/i18n/context';

export function Stats() {
  const { isEs } = useTranslation();
  const companyStats = getCompanyStats(isEs);
  return (
    <section className="border-y border-border bg-foreground py-16 text-background">
      <div className="container grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {companyStats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.08}>
            <p className="font-display text-4xl tracking-tight lg:text-5xl">
              <Counter
                value={stat.value}
                prefix={'prefix' in stat ? (stat.prefix as string) : ''}
                suffix={stat.suffix}
                decimals={stat.value % 1 !== 0 ? 1 : 0}
              />
            </p>
            <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-background/60">
              {stat.label}
            </p>
            <p className="mt-1 text-sm text-background/70">{stat.detail}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
