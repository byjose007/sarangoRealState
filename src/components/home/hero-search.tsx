'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { cities } from '@/data/reference';
import { getPropertyTypeOptions } from '@/constants/navigation';
import { useTranslation } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';

/** Floating advanced search. Writes straight into the listing page URL. */
export function HeroSearch({ className }: { className?: string }) {
  const router = useRouter();
  const { t, isEs } = useTranslation();
  const [status, setStatus] = React.useState('for-sale');
  const [city, setCity] = React.useState('');
  const [type, setType] = React.useState('');
  const [beds, setBeds] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');
  const [minArea, setMinArea] = React.useState('');
  const [q, setQ] = React.useState('');
  const [advanced, setAdvanced] = React.useState(false);

  const propertyTypes = React.useMemo(() => getPropertyTypeOptions(t), [t]);

  const tabs = React.useMemo(
    () => [
      { value: 'for-sale', label: t.hero.tabBuy },
      { value: 'for-rent', label: t.hero.tabRent },
      { value: 'new-development', label: t.hero.tabNewDev },
    ],
    [t],
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set('status', status);
    if (city) params.set('city', city);
    if (type) params.set('types', type);
    if (beds) params.set('beds', beds);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minArea) params.set('minArea', minArea);
    if (q) params.set('q', q);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className={cn('glass rounded-xl p-3 sm:p-4', className)}>
      <div className="flex flex-wrap items-center gap-1 px-1 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={cn(
              'rounded-full px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors',
              status === tab.value ? 'bg-foreground text-background' : 'hover:bg-muted/70',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div>
          <Label htmlFor="hero-city">{isEs ? 'Ciudad' : 'City'}</Label>
          <Select id="hero-city" value={city} onChange={(event) => setCity(event.target.value)}>
            <option value="">{isEs ? 'Cualquiera' : 'Anywhere we survey'}</option>
            {cities.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}, {item.state}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="hero-type">{t.hero.propertyType}</Label>
          <Select id="hero-type" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">{t.hero.allTypes}</option>
            {propertyTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="hero-beds">{t.property.bedrooms}</Label>
          <Select id="hero-beds" value={beds} onChange={(event) => setBeds(event.target.value)}>
            <option value="">{isEs ? 'Cualquiera' : 'Any'}</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}+ {isEs ? 'hab.' : 'beds'}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="submit" size="lg" className="h-11 w-full md:w-auto">
            <Search className="size-4" /> {t.nav.searchBtn}
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAdvanced((value) => !value)}
        className="mt-3 inline-flex items-center gap-2 px-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
      >
        <SlidersHorizontal className="size-3.5" /> {isEs ? 'Filtros avanzados' : 'Advanced'}
        <ChevronDown className={cn('size-3.5 transition-transform', advanced && 'rotate-180')} />
      </button>

      {advanced ? (
        <div className="mt-3 grid gap-2 border-t border-border/60 pt-3 md:grid-cols-3">
          <div>
            <Label htmlFor="hero-max">{isEs ? 'Precio máximo ($)' : 'Max price'}</Label>
            <Input
              id="hero-max"
              type="number"
              placeholder="1,200,000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="hero-area">{isEs ? 'Superficie mínima (m²)' : 'Min floor area'}</Label>
            <Input
              id="hero-area"
              type="number"
              placeholder="150"
              value={minArea}
              onChange={(event) => setMinArea(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="hero-q">{isEs ? 'Palabra clave o ref' : 'Keyword or reference'}</Label>
            <Input
              id="hero-q"
              placeholder="VS-014-TX"
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
          </div>
        </div>
      ) : null}
    </form>
  );
}
