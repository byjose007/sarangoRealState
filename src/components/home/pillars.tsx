'use client';

import * as React from 'react';
import { ClipboardCheck, Gauge, Handshake, Landmark } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { SectionHeading } from '@/components/shared/section-heading';
import { useTranslation } from '@/i18n/context';

export function Pillars() {
  const { isEs } = useTranslation();

  const pillars = React.useMemo(
    () => [
      {
        icon: ClipboardCheck,
        title: isEs ? 'Medido y luego publicado' : 'Measured, then listed',
        body: isEs
          ? 'Un perito mide la propiedad, dibuja los planos y registra las métricas. Nada se publica basándonos solo en adjetivos.'
          : 'A surveyor walks the property, draws the plan and records the readings. Nothing goes live on adjectives alone.',
      },
      {
        icon: Landmark,
        title: isEs ? 'Oficinas locales, no un call-center' : 'Local desks, not a call centre',
        body: isEs
          ? 'Tres sedes, veinte agentes locales. La persona que responde el teléfono ha estado personalmente en la casa.'
          : 'Three offices, twenty agents, and the person who answers the phone has been inside the house you are asking about.',
      },
      {
        icon: Gauge,
        title: isEs ? 'Valoración con ventas reales' : 'Priced against closings',
        body: isEs
          ? 'Tasamos con base en precios reales de cierre en la zona este trimestre, no en lo que otros aspiran a pedir.'
          : 'We value on what actually sold nearby this quarter, not on what neighbours are asking and hoping for.',
      },
      {
        icon: Handshake,
        title: isEs ? 'Un solo agente, de principio a fin' : 'One agent, start to keys',
        body: isEs
          ? 'Sin traspasos a equipos secundarios durante la negociación. Tu asesor personal te acompaña hasta la entrega de llaves.'
          : 'No handoffs to a transaction team the week your financing wobbles. The same name is on every email.',
      },
    ],
    [isEs],
  );

  return (
    <section className="container py-20 lg:py-28">
      <SectionHeading
        eyebrow={isEs ? 'Por qué Sarango Real Estate' : 'Why Sarango Real Estate'}
        title={
          isEs
            ? 'La evidencia primero. El marketing es secundario.'
            : 'The record comes first. The pitch is optional.'
        }
        lede={
          isEs
            ? 'Los cuatro compromisos que definen cada propiedad que publicamos y cada oferta que asesoramos.'
            : 'Four commitments that shape every listing we publish and every offer we advise on.'
        }
      />

      <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar, index) => (
          <Reveal key={pillar.title} delay={index * 0.08} className="bg-background p-8">
            <pillar.icon className="size-6 text-brass" />
            <h3 className="mt-6 text-lg tracking-tight">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
            <span className="mt-6 block font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground/70">
              {String(index + 1).padStart(2, '0')}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
