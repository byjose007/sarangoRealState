'use client';

import { getAmenities } from '@/data/reference';
import { useTranslation } from '@/i18n/context';
import { AmenityIcon } from './amenity-icon';

export function AmenitiesList({ ids }: { ids: string[] }) {
  const { isEs } = useTranslation();

  const groupLabels: Record<string, string> = {
    indoor: isEs ? 'Interior' : 'Inside',
    outdoor: isEs ? 'Exterior' : 'Outside',
    building: isEs ? 'Edificio' : 'Building',
    utility: isEs ? 'Instalaciones' : 'Systems',
  };

  const list = getAmenities(isEs);
  const selected = list.filter((amenity) => ids.includes(amenity.id));
  const groups = Object.keys(groupLabels).filter((group) =>
    selected.some((amenity) => amenity.group === group),
  );

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group}>
          <p className="font-mono text-eyebrow uppercase text-muted-foreground">
            {groupLabels[group]}
          </p>
          <ul className="mt-4 space-y-2.5">
            {selected
              .filter((amenity) => amenity.group === group)
              .map((amenity) => (
                <li key={amenity.id} className="flex items-center gap-3 text-sm">
                  <AmenityIcon name={amenity.icon} className="size-4 shrink-0 text-brass" />
                  {amenity.label}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
