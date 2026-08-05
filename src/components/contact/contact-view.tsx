'use client';

import { Clock, Mail, Phone } from 'lucide-react';
import { siteConfig } from '@/constants/site';
import { getFaqs } from '@/data/reference';
import { useTranslation } from '@/i18n/context';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ContactForm } from '@/features/contact/contact-form';
import { PropertyMap } from '@/components/property/property-map';
import { Accordion } from '@/components/ui/accordion';
import { SectionHeading } from '@/components/shared/section-heading';

export function ContactView() {
  const { t, isEs } = useTranslation();
  const faqs = getFaqs(isEs);

  const points = siteConfig.offices.map((office, index) => ({
    id: `office-${index}`,
    slug: 'contact',
    label: `${office.city} office`,
    price: 0,
    period: 'total' as const,
    coordinates: office.coordinates,
  }));

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="container py-12 lg:py-16">
          <Breadcrumb items={[{ label: t.nav.contact }]} />
          <h1 className="mt-6 text-headline balance">
            {isEs ? 'Habla con quien conoce cada detalle de la casa' : 'Talk to someone who has walked the house'}
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            {isEs
              ? 'Sin contestadores automáticos. Tu mensaje llega directamente al agente encargado de tu zona.'
              : 'No routing menus. Messages land with the agent covering your area.'}
          </p>

          <dl className="mt-10 grid gap-6 sm:grid-cols-3">
            <div>
              <dt className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                <Phone className="size-3.5 text-brass" /> {t.propertyDetail.phone}
              </dt>
              <dd className="mt-2">
                <a href={`tel:${siteConfig.phone}`} className="hover:text-primary">
                  {siteConfig.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                <Mail className="size-3.5 text-brass" /> {t.propertyDetail.email}
              </dt>
              <dd className="mt-2">
                <a href={`mailto:${siteConfig.email}`} className="hover:text-primary">
                  {siteConfig.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                <Clock className="size-3.5 text-brass" /> {t.common.hoursLabel}
              </dt>
              <dd className="mt-2">{t.common.hours}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="container grid gap-10 py-14 lg:grid-cols-[1.2fr_1fr]">
        <ContactForm />

        <div className="space-y-6">
          <PropertyMap points={points} className="h-72" />
          <div className="grid gap-4">
            {siteConfig.offices.map((office) => (
              <div key={office.city} className="rounded-lg border border-border bg-card p-5">
                <p className="font-display text-lg">{isEs ? `Oficina de ${office.city}` : `${office.city} office`}</p>
                <p className="mt-2 text-sm text-muted-foreground">{office.address}</p>
                <a
                  href={`tel:${office.phone}`}
                  className="mt-2 inline-block font-mono text-xs text-primary hover:underline"
                >
                  {office.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16">
        <div className="container max-w-3xl">
          <SectionHeading eyebrow={isEs ? 'Preguntas frecuentes' : 'Common questions'} title={isEs ? 'Antes de escribirnos' : 'Before you write'} align="center" />
          <Accordion items={faqs} className="mt-10" />
        </div>
      </section>
    </>
  );
}
