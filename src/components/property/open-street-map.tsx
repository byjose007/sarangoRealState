'use client';

import * as React from 'react';
import L from 'leaflet';
import type { MapPoint } from '@/lib/map';
import type { Coordinates } from '@/types';
import { formatListingPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/context';

interface OpenStreetMapProps {
  points: MapPoint[];
  center?: Coordinates;
  className?: string;
  zoom?: number;
}

export default function OpenStreetMap({
  points,
  center,
  className,
  zoom = 13,
}: OpenStreetMapProps) {
  const { t } = useTranslation();
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const leafletMapRef = React.useRef<L.Map | null>(null);

  React.useEffect(() => {
    if (!mapRef.current) return;

    // Default focus center
    const defaultCenter = center ?? points[0]?.coordinates ?? { lat: -2.9001, lng: -79.0059 };

    // Initialize Leaflet map if not initialized
    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [defaultCenter.lat, defaultCenter.lng],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // CartoDB Voyager tiles (clean aesthetic based on OpenStreetMap data)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (points.length === 0) return;

    const bounds = L.latLngBounds([]);

    points.forEach((point) => {
      const { lat, lng } = point.coordinates;
      bounds.extend([lat, lng]);

      const priceText =
        point.price > 0 ? formatListingPrice(point.price, point.period) : point.label;

      // Custom badge HTML marker
      const customIcon = L.divIcon({
        className: 'custom-osm-marker',
        html: `
          <div class="group flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[0.65rem] shadow-md transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground cursor-pointer">
            <svg class="size-3 text-brass group-hover:text-primary-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="font-semibold whitespace-nowrap">${priceText}</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      const popupContent = `
        <div class="p-2 text-foreground font-sans text-xs">
          <p class="font-display font-semibold text-sm leading-snug">${point.label}</p>
          ${
            point.price > 0
              ? `<p class="mt-1 font-mono text-primary font-medium text-xs">${formatListingPrice(point.price, point.period)}</p>`
              : ''
          }
          ${
            point.slug && point.slug !== 'contact'
              ? `<a href="/properties/${point.slug}" class="mt-2.5 inline-block rounded bg-primary px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90">${t.common.viewProperty}</a>`
              : ''
          }
        </div>
      `;

      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, {
          offset: L.point(0, -10),
        });
    });

    // Auto fit bounds if multiple points are provided
    if (points.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (points.length === 1) {
      map.setView([points[0].coordinates.lat, points[0].coordinates.lng], 15);
    }
  }, [points, center, zoom, t]);

  // Clean up map instance on unmount
  React.useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <div className={cn('relative h-full w-full overflow-hidden rounded-lg', className)}>
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
