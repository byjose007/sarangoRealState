'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  FileCheck2,
  Globe2,
  HeartHandshake,
  Landmark,
  Scan,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from '@/i18n/context';
import { SectionHeading } from '@/components/shared/section-heading';
import { Reveal } from '@/components/shared/reveal';
import { Button } from '@/components/ui/button';

export function CuencaServices() {
  const { isEs } = useTranslation();

  const reasons = [
    {
      icon: ShieldCheck,
      title: isEs ? 'Seguridad y Alta Calidad de Vida' : 'Safety & Unmatched Quality of Life',
      desc: isEs
        ? 'Cuenca es reconocida por sus bajos índices de criminalidad, entorno apacible, agua pura de montaña y cuatro ríos que atraviesan la ciudad.'
        : 'Ranked among the safest cities in Ecuador with clean mountain water, four scenic rivers, and rich cultural heritage.',
      highlight: isEs ? 'Ciudad más segura del país' : 'Safest city in Ecuador',
    },
    {
      icon: TrendingUp,
      title: isEs ? 'Plusvalía Estable en Dólares' : 'Steady USD Appreciation',
      desc: isEs
        ? 'Un mercado inmobiliario consolidado y respaldado por la economía dolarizada, con alta demanda de familias locales, migrantes y extranjeros.'
        : 'A resilient, dollarized property market with high demand from local families, returning expats, and international buyers.',
      highlight: isEs ? 'Rentabilidad patrimonial' : 'Capital preservation',
    },
    {
      icon: Landmark,
      title: isEs
        ? 'Patrimonio Cultural y Salud de Primer Nivel'
        : 'UNESCO Heritage & Top Healthcare',
      desc: isEs
        ? 'Centro histórico patrimonio de la humanidad, excelente infraestructura médica de alta especialidad y clima templado durante todo el año.'
        : 'UNESCO World Heritage architecture, world-class medical hospitals, and spring-like weather all 365 days of the year.',
      highlight: isEs ? 'Clima primaveral 365 días' : 'Temperate mountain climate',
    },
  ];

  const services = [
    {
      icon: Scan,
      title: isEs ? 'Peritaje Técnico & Planimetría 3D' : 'Technical Survey & 3D Scanning',
      body: isEs
        ? 'Medición milimétrica de linderos, verificación estructural y escaneo virtual 3D antes de publicar cualquier inmueble.'
        : 'Millimetre-accurate boundary surveys, structural assessment, and 360° virtual scans before any listing goes live.',
    },
    {
      icon: FileCheck2,
      title: isEs ? 'Saneamiento Legal y Notarial' : 'Legal & Title Due Diligence',
      body: isEs
        ? 'Revisión exhaustiva en el Registro de la Propiedad, gravámenes, líneas de fábrica y pagos municipales de plusvalía.'
        : 'Exhaustive title checks, lien releases, municipal zoning compliance, and transfer tax calculations.',
    },
    {
      icon: Globe2,
      title: isEs ? 'Asesoría para Inversionistas & Expats' : 'Expat & Investor Concierge',
      body: isEs
        ? 'Acompañamiento bilingüe integral para compradores nacionales, residentes extranjeros y ecuatorianos en el exterior.'
        : 'Bilingual end-to-end guidance for foreign investors, retirees, and Ecuadorian diaspora securing real estate.',
    },
    {
      icon: BadgePercent,
      title: isEs ? 'Gestión de Crédito Hipotecario' : 'Mortgage & Bank Facilitation',
      body: isEs
        ? 'Asesoramiento directo con entidades bancarias privadas y trámites BIESS para una aprobación ágil y sin contratiempos.'
        : 'Direct coordination with private lenders and national mortgage institutions for swift loan approvals.',
    },
  ];

  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="container">
        <SectionHeading
          eyebrow={
            isEs ? 'Enfoque Hiperlocal · Cuenca, Ecuador' : 'Hyperlocal Focus · Cuenca, Ecuador'
          }
          title={
            isEs
              ? 'Por Qué Invertir en Cuenca y Cómo Te Respaldamos'
              : 'Why Invest in Cuenca & How We Protect Your Capital'
          }
          lede={
            isEs
              ? 'Operamos exclusivamente en Cuenca y sus valles. Combinamos el conocimiento del mercado local con rigor técnico y asesoría legal en cada transacción.'
              : 'We operate exclusively in Cuenca and its valleys. Combining deep local market expertise with rigorous technical surveys and legal diligence.'
          }
        />

        {/* 1. Razones para invertir en Cuenca */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reasons.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 0.1}
              className="relative flex flex-col justify-between rounded-xl border border-border/80 bg-background/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="size-3 text-brass" /> {item.highlight}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 2. Servicios integrales de la agencia */}
        <div className="mt-16 rounded-2xl border border-border bg-background p-8 lg:p-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-primary">
                {isEs
                  ? 'Servicios Inmobiliarios Profesionales'
                  : 'Professional Real Estate Services'}
              </span>
              <h3 className="mt-2 font-display text-2xl tracking-tight text-foreground lg:text-3xl">
                {isEs
                  ? 'Tranquilidad Total en tu Compra o Venta'
                  : 'Complete Peace of Mind in Every Deal'}
              </h3>
            </div>
            <Link href="/contact">
              <Button
                variant="outline"
                className="gap-2 font-mono text-xs uppercase tracking-wider"
              >
                {isEs ? 'Agendar consulta técnica' : 'Book a consultation'}{' '}
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <Reveal
                key={service.title}
                delay={index * 0.08}
                className="group rounded-xl border border-border/60 bg-muted/25 p-6 transition-colors hover:border-primary/40 hover:bg-muted/50"
              >
                <div className="shadow-xs grid size-10 place-items-center rounded-md bg-background text-brass transition-transform group-hover:scale-110">
                  <service.icon className="size-5" />
                </div>
                <h4 className="mt-4 font-display text-base tracking-tight text-foreground">
                  {service.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{service.body}</p>
              </Reveal>
            ))}
          </div>

          {/* Banner de confianza local */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary-soft/40 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <HeartHandshake className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isEs
                    ? 'Especialistas exclusivos en Cuenca y Azuay'
                    : 'Exclusive specialists in Cuenca & Azuay'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isEs
                    ? 'Auditamos personalmente cada casa, departamento, terreno o quinta antes de negociarla.'
                    : 'We personally inspect and survey every home, lot, apartment, or estate before representing it.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" />{' '}
                {isEs ? 'Peritaje propio' : 'In-house survey'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" />{' '}
                {isEs ? 'Títulos limpios' : 'Clear titles'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
