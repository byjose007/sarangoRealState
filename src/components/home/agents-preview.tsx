'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { agents } from '@/data/agents';
import { useTranslation } from '@/i18n/context';
import { AgentCard } from '@/components/shared/agent-card';
import { SectionHeading } from '@/components/shared/section-heading';
import { buttonVariants } from '@/components/ui/button';
import { Reveal } from '@/components/shared/reveal';

export function AgentsPreview() {
  const { t } = useTranslation();

  return (
    <section className="container py-20 lg:py-28">
      <SectionHeading
        eyebrow={t.home.theDesk}
        title={t.home.agentsTitle}
        lede={t.home.agentsSubtitle}
        action={
          <Link href="/agents" className={buttonVariants({ variant: 'outline' })}>
            {t.home.meetTeam} <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className={`mt-12 grid gap-6 ${agents.length <= 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {agents.slice(0, 4).map((agent, index) => (
          <Reveal key={agent.id} delay={index * 0.07}>
            <AgentCard agent={agent} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
