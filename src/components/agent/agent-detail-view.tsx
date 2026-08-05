'use client';

import { Award, Languages, MapPin, ShieldCheck } from 'lucide-react';
import type { Agent, City, Property } from '@/types';
import { useTranslation } from '@/i18n/context';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { SmartImage } from '@/components/shared/smart-image';
import { Rating } from '@/components/shared/rating';
import { Badge } from '@/components/ui/badge';
import { PropertyGrid } from '@/components/property/property-grid';
import { AgentContactCard } from '@/components/property/agent-contact-card';
import { EmptyState } from '@/components/shared/empty-state';

interface AgentDetailViewProps {
  agent: Agent;
  city?: City;
  listings: Property[];
}

export function AgentDetailView({ agent, city, listings }: AgentDetailViewProps) {
  const { t } = useTranslation();

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="container py-12">
          <Breadcrumb items={[{ label: t.agent.title, href: '/agents' }, { label: agent.name }]} />

          <div className="mt-8 grid gap-10 lg:grid-cols-[18rem_1fr]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
              <SmartImage
                src={agent.avatar}
                alt={agent.name}
                fill
                priority
                sizes="288px"
                fallbackSeed={agent.id}
              />
            </div>

            <div>
              <h1 className="text-headline">{agent.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{agent.role}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Rating value={agent.rating} />
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {agent.dealsClosed} {t.agent.closings} · {agent.experienceYears} {t.agent.yearsExp}
                </span>
              </div>

              <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">{agent.bio}</p>

              <dl className={`mt-8 grid gap-6 border-t border-border pt-6 ${agent.license ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
                <div>
                  <dt className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    <MapPin className="size-3.5 text-brass" /> {t.agent.desk}
                  </dt>
                  <dd className="mt-2">{agent.address ?? city?.name ?? '—'}</dd>
                </div>
                {agent.license && (
                  <div>
                    <dt className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                      <ShieldCheck className="size-3.5 text-brass" /> {t.agent.license}
                    </dt>
                    <dd className="mt-2 font-medium">{agent.license}</dd>
                  </div>
                )}
                <div>
                  <dt className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    <Languages className="size-3.5 text-brass" /> {t.agent.languages}
                  </dt>
                  <dd className="mt-2">{agent.languages.join(', ')}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    <Award className="size-3.5 text-brass" /> {t.agent.specialties}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {agent.specialties.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </header>

      <section className="container grid gap-12 py-14 lg:grid-cols-[1fr_22rem]">
        <div>
          <h2 className="font-display text-2xl tracking-tight">
            {t.agent.listingsCarriedBy} {agent.name.split(' ')[0]}
          </h2>
          {listings.length ? (
            <PropertyGrid properties={listings} className="mt-8" layout="list" />
          ) : (
            <EmptyState
              title={t.agent.noLiveListings}
              body={t.agent.noLiveListingsBody}
              actionLabel={t.favorites.browseCatalogue}
              actionHref="/properties"
            />
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <AgentContactCard agent={agent} />
        </aside>
      </section>
    </>
  );
}
