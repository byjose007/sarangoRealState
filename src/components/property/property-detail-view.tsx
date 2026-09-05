'use client';

import * as React from 'react';
import Link from 'next/link';
import { Building2, CalendarDays, Fingerprint, LandPlot, Leaf, Ruler } from 'lucide-react';
import type { Agent, City, Property } from '@/types';
import { useTranslation } from '@/i18n/context';
import {
  formatArea,
  formatListingPrice,
  formatNumber,
  formatPrice,
  getStatusLabel,
  getTypeLabel,
} from '@/lib/format';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { PropertyGallery } from '@/components/property/property-gallery';
import { PropertySpecs } from '@/components/property/property-specs';
import { PropertyMap } from '@/components/property/property-map';
import { toMapPoint } from '@/lib/map';
import { PropertyVideo } from '@/components/property/property-video';
import { VirtualTour } from '@/components/property/virtual-tour';
import { FloorPlans } from '@/components/property/floor-plans';
import { AmenitiesList } from '@/components/property/amenities-list';
import { PropertyDocuments } from '@/components/property/property-documents';
import { MortgageCalculator } from '@/components/property/mortgage-calculator';
import { ScheduleVisit } from '@/components/property/schedule-visit';
import { AgentContactCard } from '@/components/property/agent-contact-card';
import { FavoriteButton } from '@/components/property/favorite-button';
import { CompareButton } from '@/components/property/compare-button';
import { ShareButtons } from '@/components/property/share-buttons';
import { PropertyGrid } from '@/components/property/property-grid';
import { RecentlyViewed, TrackView } from '@/components/property/recently-viewed';
import { SectionHeading } from '@/components/shared/section-heading';

interface PropertyDetailViewProps {
  property: Property;
  agent?: Agent;
  city?: City;
  similar: Property[];
}

export function PropertyDetailView({ property, agent, city, similar }: PropertyDetailViewProps) {
  const { language, t, isEs } = useTranslation();

  const overview = [
    { icon: Fingerprint, label: t.propertyDetail.reference, value: property.reference },
    { icon: Building2, label: t.propertyDetail.type, value: getTypeLabel(property.type, language) },
    {
      icon: Ruler,
      label: t.propertyDetail.floorArea,
      value: property.area > 0 ? formatArea(property.area, language) : '—',
    },
    {
      icon: LandPlot,
      label: t.propertyDetail.land,
      value: property.landArea ? formatArea(property.landArea, language) : '—',
    },
    { icon: CalendarDays, label: t.propertyDetail.yearBuilt, value: String(property.yearBuilt) },
    { icon: Leaf, label: t.propertyDetail.energyRating, value: property.energyRating },
  ];

  const details: [string, string][] = [
    [t.propertyDetail.bedrooms, String(property.bedrooms || '—')],
    [t.propertyDetail.bathrooms, String(property.bathrooms)],
    [t.propertyDetail.garages, String(property.garages || '—')],
    ...(property.floorLevel
      ? [[isEs ? 'Nivel / Pisos' : 'Floor level', property.floorLevel] as [string, string]]
      : []),
    ...(property.deposit
      ? [
          [isEs ? 'Garantía' : 'Security deposit', formatPrice(property.deposit)] as [
            string,
            string,
          ],
        ]
      : []),
    ...(property.leaseTerm
      ? [[isEs ? 'Contrato mínimo' : 'Min. lease term', property.leaseTerm] as [string, string]]
      : []),
    ...(property.utilitiesIncluded !== undefined
      ? [
          [
            isEs ? 'Servicios básicos' : 'Utilities',
            property.utilitiesIncluded
              ? isEs
                ? 'Incluidos en el canon 💧'
                : 'Included in rent'
              : isEs
                ? 'Por cuenta del inquilino'
                : 'Separate / excluded',
          ] as [string, string],
        ]
      : []),
    ...(property.petsAllowed !== undefined
      ? [
          [
            isEs ? 'Política de mascotas' : 'Pets policy',
            property.petsAllowed
              ? isEs
                ? '🐾 Se admiten mascotas'
                : 'Pets allowed'
              : isEs
                ? '🚫 No se aceptan mascotas'
                : 'No pets allowed',
          ] as [string, string],
        ]
      : []),
    ...(property.commercialUse
      ? [
          [isEs ? 'Uso comercial / Ideal para' : 'Ideal use', property.commercialUse] as [
            string,
            string,
          ],
        ]
      : []),
    [t.propertyDetail.propertyTax, property.propertyTax ? formatPrice(property.propertyTax) : '—'],
    [
      t.propertyDetail.hoaFee,
      property.hoaFee ? formatPrice(property.hoaFee) : isEs ? 'Ninguna' : 'None',
    ],
    [t.propertyDetail.viewsThisMonth, formatNumber(property.views)],
  ];

  return (
    <>
      <TrackView propertyId={property.id} />

      <header className="border-b border-border bg-surface">
        <div className="container py-10">
          <Breadcrumb
            items={[
              { label: t.property.allProperties, href: '/properties' },
              {
                label: city?.name ?? (isEs ? 'Ciudad' : 'City'),
                href: `/properties?city=${property.citySlug}`,
              },
              { label: property.reference },
            ]}
          />

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={property.status === 'for-rent' ? 'brass' : 'solid'}>
                  {getStatusLabel(property.status, language)}
                </Badge>
                <Badge variant="outline">{getTypeLabel(property.type, language)}</Badge>
                {property.floorLevel ? (
                  <Badge variant="outline">{property.floorLevel}</Badge>
                ) : null}
                {property.petsAllowed === false ? (
                  <Badge
                    variant="outline"
                    className="border-red-500/30 text-red-600 dark:text-red-400"
                  >
                    🚫 {isEs ? 'No mascotas' : 'No pets'}
                  </Badge>
                ) : property.petsAllowed === true ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  >
                    🐾 {isEs ? 'Pet friendly' : 'Pet friendly'}
                  </Badge>
                ) : null}
                {property.utilitiesIncluded === true ? (
                  <Badge
                    variant="outline"
                    className="border-blue-500/30 text-blue-600 dark:text-blue-400"
                  >
                    💧 {isEs ? 'Servicios incluidos' : 'Utilities included'}
                  </Badge>
                ) : null}
                <Badge variant="soft">{t.propertyDetail.surveyComplete}</Badge>
              </div>
              <h1 className="balance mt-4 max-w-2xl text-headline">{property.title}</h1>
              <p className="mt-3 text-muted-foreground">{property.address}</p>
              <PropertySpecs property={property} size="md" className="mt-5" />
            </div>

            <div className="text-left sm:text-right">
              <p className="font-display text-4xl tracking-tight">
                {formatListingPrice(property.price, property.pricePeriod, language)}
              </p>
              {property.area > 0 ? (
                <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {formatPrice(Math.round(property.price / property.area))}{' '}
                  {isEs ? 'por m²' : 'per sq ft'}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2 sm:justify-end">
                <FavoriteButton propertyId={property.id} title={property.title} withLabel />
                <CompareButton propertyId={property.id} title={property.title} withLabel />
                <ShareButtons title={property.title} path={`/properties/${property.slug}`} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-10">
        <PropertyGallery
          images={property.images}
          title={property.title}
          reference={property.reference}
        />
      </div>

      <div className="container grid gap-12 pb-16 lg:grid-cols-[1fr_23rem]">
        <div className="space-y-14">
          <section>
            <h2 className="font-display text-2xl tracking-tight">{t.propertyDetail.overview}</h2>
            <dl className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {overview.map((item) => (
                <div key={item.label} className="bg-card p-5">
                  <item.icon className="size-4 text-brass" />
                  <dt className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-1 font-display text-lg tracking-tight">{item.value}</dd>
                </div>
              ))}
            </dl>

            {property.status === 'for-rent' ? (
              <div className="mt-8 overflow-hidden rounded-xl border border-brass/30 bg-surface/80 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                  <div>
                    <h3 className="font-display text-xl tracking-tight text-foreground">
                      {isEs ? 'Condiciones de Arriendo' : 'Rental Terms & Conditions'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isEs
                        ? 'Resumen contractual y valores iniciales para el inquilino'
                        : 'Contractual summary and move-in figures'}
                    </p>
                  </div>
                  <span className="rounded-full bg-brass/10 px-3 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-wider text-brass">
                    {isEs ? 'Alquiler Mensual' : 'Monthly Lease'}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                      {isEs ? 'Canon Mensual' : 'Monthly Rent'}
                    </p>
                    <p className="mt-1 font-display text-2xl tracking-tight text-foreground">
                      {formatPrice(property.price)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {property.utilitiesIncluded === true
                        ? isEs
                          ? '💧 Incluye servicios básicos'
                          : 'Includes utilities'
                        : isEs
                          ? 'Servicios por separado'
                          : 'Utilities separate'}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                      {isEs ? 'Garantía Requerida' : 'Security Deposit'}
                    </p>
                    <p className="mt-1 font-display text-2xl tracking-tight text-foreground">
                      {property.deposit
                        ? formatPrice(property.deposit)
                        : formatPrice(property.price)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {isEs ? 'Reembolsable al finalizar' : 'Refundable at lease end'}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                      {isEs ? 'Total Ingreso Inicial' : 'Total Move-in Cost'}
                    </p>
                    <p className="mt-1 font-display text-2xl tracking-tight text-brass">
                      {formatPrice(property.price + (property.deposit ?? property.price))}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {isEs ? '1er mes + garantía' : '1st month + deposit'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <strong className="text-foreground">{isEs ? 'Contrato:' : 'Lease:'}</strong>{' '}
                    {property.leaseTerm || (isEs ? 'Mínimo 1 año' : '1 year minimum')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <strong className="text-foreground">{isEs ? 'Mascotas:' : 'Pets:'}</strong>{' '}
                    {property.petsAllowed === false
                      ? isEs
                        ? '🚫 No se aceptan mascotas'
                        : 'No pets allowed'
                      : property.petsAllowed === true
                        ? isEs
                          ? '🐾 Se admiten mascotas'
                          : 'Pets allowed'
                        : isEs
                          ? 'A consultar'
                          : 'Inquire'}
                  </span>
                  {property.floorLevel ? (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <strong className="text-foreground">{isEs ? 'Nivel:' : 'Floor:'}</strong>{' '}
                      {property.floorLevel}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            {property.commercialUse ? (
              <div className="mt-6 rounded-lg border border-border bg-card p-5">
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brass">
                  {isEs ? 'Aptitud Comercial / Ideal para:' : 'Recommended Commercial Use:'}
                </p>
                <p className="mt-1 text-base font-medium text-foreground">
                  {property.commercialUse}
                </p>
              </div>
            ) : null}

            <div className="mt-8 space-y-5">
              {property.description.split('\n\n').map((paragraph) => (
                <p key={paragraph} className="max-w-3xl leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight">{t.propertyDetail.theRecord}</h2>
            <Tabs
              className="mt-6"
              tabs={[
                {
                  value: 'details',
                  label: t.propertyDetail.detailsTab,
                  content: (
                    <dl className="divide-y divide-border border-y border-border">
                      {details.map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between py-3.5 text-sm"
                        >
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="font-mono">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ),
                },
                {
                  value: 'amenities',
                  label: t.propertyDetail.amenitiesTab,
                  content: <AmenitiesList ids={property.amenityIds} />,
                },
                {
                  value: 'plans',
                  label: t.propertyDetail.floorPlansTab,
                  content: <FloorPlans plans={property.floorPlans} />,
                },
                {
                  value: 'documents',
                  label: t.propertyDetail.documentsTab,
                  content: <PropertyDocuments documents={property.documents} />,
                },
                {
                  value: 'nearby',
                  label: t.propertyDetail.nearbyTab,
                  content: (
                    <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                      {property.nearby.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-baseline justify-between gap-3 border-b border-border pb-2 text-sm"
                        >
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-mono text-xs">{item.distance} km</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
              ]}
            />
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight">{t.propertyDetail.walkthrough}</h2>
            <div className="mt-6 grid gap-6">
              <PropertyVideo
                url={property.videoUrl ?? 'https://www.youtube.com/embed/ScMzIvxBSi4'}
                poster={property.images[3] ?? (property.images[0] as string)}
                title={property.title}
              />
              <div>
                <p className="mb-3 font-mono text-eyebrow uppercase text-muted-foreground">
                  {isEs ? 'Vista 360° interactiva' : '360° room view'}
                </p>
                <VirtualTour
                  image={property.images[4] ?? (property.images[1] as string)}
                  title={property.title}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight">{t.propertyDetail.location}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{property.address}</p>
            <PropertyMap
              points={[toMapPoint(property)]}
              center={property.coordinates}
              address={property.address}
              allowProvider
              className="mt-6 h-[24rem]"
            />
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight">{t.propertyDetail.financing}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {isEs
                ? 'Ajusta el enganche, plazo e interés para calcular la cuota mensual. Los gastos e impuestos provienen de la ficha oficial.'
                : 'Adjust the deposit, term and rate to see the monthly figure. Tax and HOA are pulled from this listing’s record.'}
            </p>
            <MortgageCalculator
              className="mt-6"
              price={property.price}
              propertyTax={property.propertyTax}
              hoa={property.hoaFee ?? 0}
            />
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <ScheduleVisit reference={property.reference} />
          {agent ? (
            <AgentContactCard
              agent={agent}
              subject={`${property.reference} — ${property.title}`}
              propertyTitle={property.title}
              propertyRef={property.reference}
            />
          ) : null}
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="font-mono text-eyebrow uppercase text-muted-foreground">
              {t.propertyDetail.needRawFile}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{t.propertyDetail.rawFileDesc}</p>
            <Link
              href="/contact"
              className="mt-4 inline-block font-mono text-[0.68rem] uppercase tracking-[0.14em] text-primary hover:underline"
            >
              {t.propertyDetail.requestPack}
            </Link>
          </div>
        </aside>
      </div>

      <section className="border-t border-border bg-surface py-16">
        <div className="container">
          <SectionHeading
            eyebrow={isEs ? 'Inmuebles comparables' : 'Comparable records'}
            title={t.propertyDetail.comparableRecords}
          />
          <PropertyGrid properties={similar} className="mt-10" />
        </div>
      </section>

      <RecentlyViewed exclude={property.id} />
    </>
  );
}
