'use client';

import { Bath, BedDouble, Car, Ruler } from 'lucide-react';
import type { Property } from '@/types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/context';

/** Bed / bath / area / garage strip — mono figures, hairline dividers. */
export function PropertySpecs({
  property,
  className,
  size = 'sm',
}: {
  property: Property;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const { isEs } = useTranslation();

  if (property.type === 'land') {
    const landSize = property.landArea || property.area;
    return (
      <ul
        className={cn(
          'flex flex-wrap items-center gap-x-5 gap-y-2 font-mono uppercase text-muted-foreground',
          size === 'sm' ? 'text-[0.7rem]' : 'text-xs',
          className,
        )}
      >
        <li className="inline-flex items-center gap-1.5">
          <Ruler className="size-3.5 text-brass" aria-hidden="true" />
          <span className="font-semibold text-foreground">{formatNumber(landSize)}</span>
          <span className="tracking-[0.12em]">{isEs ? 'm² de terreno' : 'sq ft lot'}</span>
        </li>
        {property.garages ? (
          <li className="inline-flex items-center gap-1.5">
            <Car className="size-3.5 text-brass" aria-hidden="true" />
            <span className="text-foreground">{property.garages}</span>
            <span className="tracking-[0.12em]">{isEs ? 'garaje' : 'garage'}</span>
          </li>
        ) : null}
      </ul>
    );
  }

  const items = [
    { icon: BedDouble, value: property.bedrooms || '—', label: isEs ? 'hab' : 'bed' },
    { icon: Bath, value: property.bathrooms || '—', label: isEs ? 'baño' : 'bath' },
    {
      icon: Ruler,
      value: property.area > 0 ? formatNumber(property.area) : '—',
      label: isEs ? 'm²' : 'sq ft',
    },
    { icon: Car, value: property.garages || '—', label: isEs ? 'garaje' : 'garage' },
  ];

  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-5 gap-y-2 font-mono uppercase text-muted-foreground',
        size === 'sm' ? 'text-[0.7rem]' : 'text-xs',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <item.icon className="size-3.5 text-brass" aria-hidden="true" />
          <span className="text-foreground">{item.value}</span>
          <span className="tracking-[0.12em]">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
