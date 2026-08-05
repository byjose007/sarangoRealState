'use client';

import Link from 'next/link';
import type { Agent } from '@/types';
import { getCompanyStats, getMilestones } from '@/data/reference';
import { siteConfig } from '@/constants/site';
import { unsplash } from '@/data/images';
import { useTranslation } from '@/i18n/context';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { SmartImage } from '@/components/shared/smart-image';
import { Counter } from '@/components/shared/counter';
import { Reveal } from '@/components/shared/reveal';
import { AgentCard } from '@/components/shared/agent-card';
import { SectionHeading } from '@/components/shared/section-heading';
import { buttonVariants } from '@/components/ui/button';

interface AboutViewProps {
  agents: Agent[];
}

export function AboutView({ agents }: AboutViewProps) {
  const { t, isEs } = useTranslation();

  const companyStats = getCompanyStats(isEs);
  const milestones = getMilestones(isEs);

  return (
    <>
      <header className="container py-12 lg:py-16">
        <Breadcrumb items={[{ label: t.footer.about }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <span className="eyebrow">{isEs ? `Desde ${siteConfig.founded}` : `Since ${siteConfig.founded}`}</span>
            <h1 className="mt-5 text-headline balance">
              {isEs ? 'Empezamos con una cinta métrica' : 'We started with a tape measure'}
              <span className="block italic text-primary">
                {isEs ? 'y nunca la dejamos.' : 'and never put it down.'}
              </span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isEs
              ? 'Vestra nació con un principio claro: las propiedades se deben medir y certificar con hechos antes de publicarse. La evidencia va primero; el marketing, después.'
              : 'Vestra was built on a simple frustration: property listings describe a feeling and hide a fact. We flipped it. The survey comes first, the marketing second, and if the two ever disagree the survey wins.'}
          </p>
        </div>

        <div className="tick-frame relative mt-12 aspect-[16/7] overflow-hidden rounded-xl">
          <SmartImage src={unsplash(6, 1600, 700)} alt="A Vestra survey in progress" fill priority sizes="100vw" fallbackSeed="about" />
        </div>
      </header>

      <section className="border-y border-border bg-foreground py-16 text-background">
        <div className="container grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {companyStats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.07}>
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
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">{isEs ? 'Misión' : 'Mission'}</span>
            <h2 className="mt-4 text-headline balance">
              {isEs ? 'Publicar la evidencia antes del precio' : 'Make the record public before the price'}
            </h2>
            <p className="mt-5 text-muted-foreground">
              {isEs
                ? 'Un comprador debe poder comparar viviendas con las mismas pruebas: planos medidos, históricos de suministros y notas técnicas. Publicamos todo en cada ficha.'
                : 'A buyer should be able to compare two homes on the same evidence: dimensions, readings, works history, disclosure. We publish all four on every listing, whether it flatters the property or not.'}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow">{isEs ? 'Visión' : 'Vision'}</span>
            <h2 className="mt-4 text-headline balance">
              {isEs ? 'Un mercado basado en datos reales' : 'A market that argues about facts'}
            </h2>
            <p className="mt-5 text-muted-foreground">
              {isEs
                ? 'Las negociaciones son más rápidas y justas cuando ambas partes leen la misma auditoría. Queremos que este rigor sea la norma en cada ciudad donde operamos.'
                : 'Negotiations get shorter and fairer when both sides read the same survey. We would like that to be the default in every city we work in, including the ones we do not cover yet.'}
            </p>
          </Reveal>
        </div>

        <ol className="mt-16 divide-y divide-border border-y border-border">
          {milestones.map((milestone) => (
            <li key={milestone.year} className="grid gap-4 py-8 md:grid-cols-[8rem_1fr_2fr]">
              <span className="font-mono text-sm text-brass">{milestone.year}</span>
              <h3 className="font-display text-xl tracking-tight">{milestone.title}</h3>
              <p className="text-muted-foreground">{milestone.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-surface py-20">
        <div className="container">
          <SectionHeading
            eyebrow={t.home.theDesk}
            title={t.home.agentsTitle}
            action={
              <Link href="/agents" className={buttonVariants({ variant: 'outline' })}>
                {t.footer.ourAgents}
              </Link>
            }
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {agents.slice(4, 8).map((agent, index) => (
              <Reveal key={agent.id} delay={index * 0.06}>
                <AgentCard agent={agent} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
