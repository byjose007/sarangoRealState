'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Agent, Property } from '@/types';
import { useUi } from '@/store/ui-store';
import { getAgentByIdAction, getPropertyByIdAction } from '@/actions/public-catalog';
import { formatListingPrice, getStatusLabel, getTypeLabel } from '@/lib/format';
import { useTranslation } from '@/i18n/context';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/shared/smart-image';
import { PropertySpecs } from './property-specs';
import { FavoriteButton } from './favorite-button';
import { CompareButton } from './compare-button';

/** Mounted once in the root layout; any card can open it. */
export function QuickViewHost() {
  const id = useUi((state) => state.quickViewId);
  const close = useUi((state) => state.closeQuickView);
  const { language, t, isEs } = useTranslation();
  const [property, setProperty] = React.useState<Property | null>(null);
  const [agent, setAgent] = React.useState<Agent | null>(null);

  React.useEffect(() => {
    if (!id) {
      setProperty(null);
      setAgent(null);
      return;
    }
    let active = true;
    getPropertyByIdAction(id).then((result) => {
      if (!active) return;
      setProperty(result);
      if (result) getAgentByIdAction(result.agentId).then((a) => active && setAgent(a));
    });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <Modal open={Boolean(property)} onClose={close} className="max-w-3xl p-0" variant="card">
      {property ? (
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
            <SmartImage
              src={property.images[1] ?? (property.images[0] as string)}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              fallbackSeed={`${property.id}-quick`}
              className="md:rounded-l-lg"
            />
            <Badge variant="glass" className="absolute left-4 top-4">
              {property.reference}
            </Badge>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2">
              <Badge variant="soft">{getStatusLabel(property.status, language)}</Badge>
              <Badge variant="outline">{getTypeLabel(property.type, language)}</Badge>
            </div>
            <h2 className="mt-4 font-display text-2xl leading-tight tracking-tight">
              {property.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{property.address}</p>
            <p className="mt-4 font-mono text-2xl">
              {formatListingPrice(property.price, property.pricePeriod, language)}
            </p>

            <PropertySpecs property={property} className="mt-5 border-y border-border py-4" />

            <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
              {property.description.split('\n\n')[1] || property.description}
            </p>

            {agent ? (
              <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                {isEs ? `Gestionado por ${agent.name}` : `Listed by ${agent.name}`}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={`/properties/${property.slug}`} onClick={close}>
                <Button>
                  {t.property.viewDetails} <ArrowRight className="size-4" />
                </Button>
              </Link>
              <FavoriteButton propertyId={property.id} title={property.title} withLabel />
              <CompareButton propertyId={property.id} title={property.title} withLabel />
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
