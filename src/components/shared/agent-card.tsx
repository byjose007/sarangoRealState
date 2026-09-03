'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Agent } from '@/types';
import { cities } from '@/data/reference';
import { useTranslation } from '@/i18n/context';
import { SmartImage } from './smart-image';
import { Rating } from './rating';

export function AgentCard({ agent }: { agent: Agent }) {
  const city = cities.find((item) => item.slug === agent.citySlug);
  const { t } = useTranslation();

  return (
    <article className="group h-full overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lift">
      <div className="relative aspect-[4/5] overflow-hidden">
        <SmartImage
          src={agent.avatar}
          alt={agent.name}
          fill
          sizes="(max-width: 640px) 100vw, 25vw"
          fallbackSeed={agent.id}
          className="transition-transform duration-700 ease-entrance group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em]">
          {city?.name ?? 'Sarango Real Estate'}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg tracking-tight">
          <Link
            href={`/agents/${agent.slug}`}
            className="inline-flex items-center gap-1.5 hover:text-primary"
          >
            {agent.name}
            <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{agent.role}</p>
        {agent.license && (
          <p className="mt-1 font-mono text-[0.68rem] font-medium text-brass">{agent.license}</p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <Rating value={agent.rating} />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
            {agent.dealsClosed} {t.agent.closings}
          </span>
        </div>
      </div>
    </article>
  );
}
