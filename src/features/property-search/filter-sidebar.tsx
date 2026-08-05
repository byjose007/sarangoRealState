'use client';

import * as React from 'react';
import { RotateCcw } from 'lucide-react';
import { cities, getAmenities } from '@/data/reference';
import { getPropertyTypeOptions } from '@/constants/navigation';
import { formatPrice } from '@/lib/format';
import { useTranslation } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { Input, Label, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePropertyFilters } from './use-property-filters';

export function FilterSidebar({ className }: { className?: string }) {
  const { filters, write, reset, activeCount } = usePropertyFilters();
  const { t, isEs } = useTranslation();

  const propertyTypes = React.useMemo(() => getPropertyTypeOptions(t), [t]);

  const statusOptions = React.useMemo(
    () => [
      { value: 'all', label: t.explorer.all },
      { value: 'for-sale', label: t.explorer.buy },
      { value: 'for-rent', label: t.explorer.rent },
      { value: 'new-development', label: t.explorer.newDev },
    ],
    [t],
  );

  const toggleType = (value: string) => {
    const current = filters.types ?? [];
    write({ types: current.includes(value as never) ? current.filter((item) => item !== value) : [...current, value] });
  };

  const toggleAmenity = (value: string) => {
    const current = filters.amenities ?? [];
    write({ amenities: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
  };

  return (
    <aside className={cn('space-y-7', className)} aria-label={t.explorer.filters}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-eyebrow uppercase text-muted-foreground">
          {t.explorer.filters} {activeCount ? `· ${activeCount}` : ''}
        </p>
        {activeCount ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-primary hover:underline"
          >
            <RotateCcw className="size-3" /> {t.explorer.reset}
          </button>
        ) : null}
      </div>

      <div>
        <Label>{t.explorer.keyword}</Label>
        <Input
          defaultValue={filters.q ?? ''}
          placeholder={t.explorer.keywordPlaceholder}
          onChange={(event) => write({ q: event.target.value })}
        />
      </div>

      <div>
        <Label>{t.explorer.listingType}</Label>
        <div className="grid grid-cols-4 gap-1 rounded-sm border border-border p-1">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => write({ status: option.value })}
              className={cn(
                'rounded-xs py-2 font-mono text-[0.65rem] uppercase tracking-[0.1em] transition-colors',
                (filters.status ?? 'all') === option.value
                  ? 'bg-foreground text-background'
                  : 'hover:bg-muted',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>{isEs ? 'Ciudad' : 'City'}</Label>
        <Select value={filters.citySlug ?? ''} onChange={(event) => write({ city: event.target.value })}>
          <option value="">{t.explorer.everyCity}</option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}, {city.state}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>{t.hero.propertyType}</Label>
        <div className="flex flex-wrap gap-2">
          {propertyTypes.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleType(option.value)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs transition-colors',
                filters.types?.includes(option.value)
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-border hover:bg-muted',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>{t.explorer.priceRangeUSD}</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder={t.explorer.min}
            defaultValue={filters.minPrice ?? ''}
            onBlur={(event) => write({ minPrice: event.target.value })}
          />
          <Input
            type="number"
            placeholder={t.explorer.max}
            defaultValue={filters.maxPrice ?? ''}
            onBlur={(event) => write({ maxPrice: event.target.value })}
          />
        </div>
        <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
          {filters.minPrice ? formatPrice(filters.minPrice) : t.explorer.noMinimum} —{' '}
          {filters.maxPrice ? formatPrice(filters.maxPrice) : t.explorer.noMaximum}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t.explorer.bedsMin}</Label>
          <Select value={filters.bedrooms ?? ''} onChange={(event) => write({ beds: event.target.value })}>
            <option value="">{t.explorer.any}</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}+
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>{t.explorer.bathsMin}</Label>
          <Select value={filters.bathrooms ?? ''} onChange={(event) => write({ baths: event.target.value })}>
            <option value="">{t.explorer.any}</option>
            {[1, 2, 3, 4].map((value) => (
              <option key={value} value={value}>
                {value}+
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label>{t.explorer.floorArea}</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder={t.explorer.min}
            defaultValue={filters.minArea ?? ''}
            onBlur={(event) => write({ minArea: event.target.value })}
          />
          <Input
            type="number"
            placeholder={t.explorer.max}
            defaultValue={filters.maxArea ?? ''}
            onBlur={(event) => write({ maxArea: event.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>{t.explorer.mustInclude}</Label>
        <div className="grid gap-2">
          {getAmenities(isEs).slice(0, 10).map((amenity) => {
            const checked = filters.amenities?.includes(amenity.id) ?? false;
            return (
              <label key={amenity.id} className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAmenity(amenity.id)}
                  className="size-4 rounded-xs accent-[hsl(var(--primary))]"
                />
                {amenity.label}
              </label>
            );
          })}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={reset}>
        {t.explorer.clearAllFilters}
      </Button>
    </aside>
  );
}
