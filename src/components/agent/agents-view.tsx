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
          <h1 className="balance mt-6 text-headline">{t.agent.title}</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">{t.agent.subtitle}</p>
        </div>
      </header>

      <section className="container py-14">
        <div
          className={`grid gap-6 ${agents.length <= 2 ? 'mx-auto max-w-3xl sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}
        >
          {agents.map((agent, index) => (
            <Reveal key={agent.id} delay={Math.min(index, 8) * 0.05}>
              <AgentCard agent={agent} />
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-6 border-t border-border pt-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <p className="font-display text-lg">
                {isEs ? 'Sede Central Cuenca' : 'Cuenca Headquarters'}
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEs
                ? 'Edificio Alameda 1, José Astudillo Regalado. Operación principal y atención personalizada para todo Azuay.'
                : 'Alameda 1 Building, José Astudillo Regalado. Primary headquarters serving all of Azuay.'}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brass" />
              <p className="font-display text-lg">
                {isEs ? 'Cobertura Cantonal' : 'Regional Coverage'}
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEs
                ? 'Levantamiento pericial y comercialización en todos los sectores urbanos y campestres de Cuenca.'
                : 'Technical appraisal and listings throughout all urban and rural sectors of Cuenca.'}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-muted-foreground" />
              <p className="font-display text-lg">
                {isEs ? 'Próxima Expansión' : 'Upcoming Expansion'}
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEs
                ? 'Próximamente apertura de operaciones en Quito, Guayaquil y principales ciudades del país.'
                : 'Upcoming expansion to Quito, Guayaquil and major cities across Ecuador.'}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
