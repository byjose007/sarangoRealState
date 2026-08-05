'use client';

import type { Agent, City } from '@/types';
import { useTranslation } from '@/i18n/context';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AgentCard } from '@/components/shared/agent-card';
import { Reveal } from '@/components/shared/reveal';

export function AgentsView({ agents, cities }: { agents: Agent[]; cities: City[] }) {
  const { t, isEs } = useTranslation();

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="container py-12 lg:py-16">
          <Breadcrumb items={[{ label: t.agent.title }]} />
          <h1 className="mt-6 text-headline balance">{t.agent.title}</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            {t.agent.subtitle}
          </p>
        </div>
      </header>

      <section className="container py-14">
        <div className={`grid gap-6 ${agents.length <= 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {agents.map((agent, index) => (
            <Reveal key={agent.id} delay={Math.min(index, 8) * 0.05}>
              <AgentCard agent={agent} />
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-4 border-t border-border pt-10 sm:grid-cols-3">
          {cities.slice(0, 3).map((city) => (
            <div key={city.slug}>
              <p className="font-display text-lg">{isEs ? `Oficina de ${city.name}` : `${city.name} desk`}</p>
              <p className="mt-2 text-sm text-muted-foreground">{city.blurb}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
