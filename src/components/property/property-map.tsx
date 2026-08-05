'use client';

import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ExternalLink, MapPin } from 'lucide-react';
import type { Coordinates } from '@/types';
import type { MapPoint } from '@/lib/map';
import { mapConfig } from '@/constants/site';
import { formatListingPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

const OpenStreetMap = dynamic(() => import('./open-street-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/40">
      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground animate-pulse">
        <MapPin className="size-4 text-brass" /> Cargando mapa OpenStreetMap...
      </div>
    </div>
  ),
});

interface PropertyMapProps {
  points: MapPoint[];
  center?: Coordinates;
  className?: string;
  /** Single-point pages can use the provider embed; the list view always uses the plan. */
  allowProvider?: boolean;
  address?: string;
}

/**
 * Rendering modes:
 *  - `openstreetmap` → Open-source Leaflet map (default, interactive, no key required)
 *  - `google`        → Maps Embed API iframe (needs NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY)
 *  - `mapbox`        → Static Images API (needs NEXT_PUBLIC_MAPBOX_TOKEN)
 *  - `static`        → in-house grid plan view
 */
export type { MapPoint };

export function PropertyMap({
  points,
  center,
  className,
  allowProvider = false,
  address,
}: PropertyMapProps) {
  const [active, setActive] = React.useState<string | null>(points[0]?.id ?? null);
  const focus = center ?? points[0]?.coordinates ?? { lat: -2.9001, lng: -79.0059 };
  const directions = `https://www.google.com/maps/search/?api=1&query=${focus.lat},${focus.lng}`;

  if (allowProvider && mapConfig.provider === 'google' && mapConfig.googleKey) {
    return (
      <Frame className={className} directions={directions}>
        <iframe
          title="Property location"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
          src={`https://www.google.com/maps/embed/v1/place?key=${mapConfig.googleKey}&q=${encodeURIComponent(
            address ?? `${focus.lat},${focus.lng}`,
          )}&zoom=14`}
        />
      </Frame>
    );
  }

  if (allowProvider && mapConfig.provider === 'mapbox' && mapConfig.mapboxToken) {
    const src = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-l+1f5d53(${focus.lng},${focus.lat})/${focus.lng},${focus.lat},13.5,0/1200x600@2x?access_token=${mapConfig.mapboxToken}`;
    return (
      <Frame className={className} directions={directions}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Property location" className="h-full w-full object-cover" />
      </Frame>
    );
  }

  if (mapConfig.provider === 'openstreetmap') {
    return (
      <Frame className={className} directions={directions}>
        <OpenStreetMap points={points} center={center} />
      </Frame>
    );
  }

  // ---- Plan view -----------------------------------------------------------
  const lats = points.map((point) => point.coordinates.lat);
  const lngs = points.map((point) => point.coordinates.lng);
  const pad = 0.02;
  const minLat = Math.min(...lats) - pad;
  const maxLat = Math.max(...lats) + pad;
  const minLng = Math.min(...lngs) - pad;
  const maxLng = Math.max(...lngs) + pad;

  const position = (coordinates: Coordinates) => ({
    left: `${((coordinates.lng - minLng) / Math.max(maxLng - minLng, 0.0001)) * 100}%`,
    top: `${(1 - (coordinates.lat - minLat) / Math.max(maxLat - minLat, 0.0001)) * 100}%`,
  });

  return (
    <Frame className={className} directions={directions}>
      <div className="relative h-full w-full bg-muted/50 bg-grid-plan bg-[length:38px_38px]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/50 via-transparent to-brass/10" />
        {points.map((point) => {
          const isActive = point.id === active;
          return (
            <div key={point.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={position(point.coordinates)}>
              <button
                type="button"
                onClick={() => setActive(isActive ? null : point.id)}
                aria-label={point.label}
                className={cn(
                  'group flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[0.65rem] shadow-soft transition-all',
                  isActive
                    ? 'z-20 border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface hover:border-primary',
                )}
              >
                <MapPin className="size-3" />
                {formatListingPrice(point.price, point.period)}
              </button>

              {isActive && points.length > 1 ? (
                <Link
                  href={`/properties/${point.slug}`}
                  className="absolute left-1/2 top-full z-30 mt-2 w-56 -translate-x-1/2 rounded-md border border-border bg-surface p-3 shadow-lift"
                >
                  <p className="font-display text-sm leading-tight">{point.label}</p>
                  <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                    View record
                  </p>
                </Link>
              ) : null}
            </div>
          );
        })}

        <span className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
          Plan view · {points.length} {points.length === 1 ? 'parcel' : 'parcels'}
        </span>
      </div>
    </Frame>
  );
}

function Frame({
  children,
  className,
  directions,
}: {
  children: React.ReactNode;
  className?: string;
  directions: string;
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg border border-border', className)}>
      {children}
      <a
        href={directions}
        target="_blank"
        rel="noreferrer noopener"
        className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-surface/95 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] shadow-soft hover:bg-surface"
      >
        Get directions <ExternalLink className="size-3" />
      </a>
    </div>
  );
}
