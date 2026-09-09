'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { activeCity, upcomingCities, cuencaSectors } from '@/data/reference';
import { getPropertyTypeOptions } from '@/constants/navigation';
import { useTranslation } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';

/** Floating advanced search. Writes straight into the listing page URL. */
export function HeroSearch({ className }: { className?: string }) {
  const router = useRouter();
  const { t, isEs } = useTranslation();
  const [status, setStatus] = React.useState('for-rent');
  const [city, setCity] = React.useState('cuenca');
  const [sector, setSector] = React.useState('');
  const [type, setType] = React.useState('');
  const [beds, setBeds] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');
  const [minArea, setMinArea] = React.useState('');
  const [q, setQ] = React.useState('');
  const [advanced, setAdvanced] = React.useState(false);

  const propertyTypes = React.useMemo(() => getPropertyTypeOptions(t), [t]);

  const operationOptions = React.useMemo(
    () => [
      { value: 'for-rent', label: t.hero.tabRent },
      { value: 'for-sale', label: t.hero.tabBuy },
      { value: 'new-development', label: t.hero.tabNewDev },
      { value: 'all', label: t.hero.allOperations },
    ],
    [t],
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (status && status !== 'all') {
      params.set('status', status);
    }
    if (city) params.set('city', city);
    if (type) params.set('types', type);
    if (beds) params.set('beds', beds);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minArea) params.set('minArea', minArea);
    const combinedQ = [q, sector].filter(Boolean).join(' ');
    if (combinedQ) params.set('q', combinedQ);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className={cn('glass rounded-xl p-3 sm:p-4', className)}>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.35fr_1.1fr_0.9fr_auto]">
        <div>
          <Label htmlFor="hero-operation">{t.hero.operation}</Label>
          <Select
            id="hero-operation"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {operationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="hero-city">{isEs ? 'Ciudad' : 'City'}</Label>
          <Select id="hero-city" value={city} onChange={(event) => setCity(event.target.value)}>
            <option value="cuenca">
              {isEs ? 'Cuenca, Azuay (Operación activa)' : 'Cuenca, Azuay (Active)'}
            </option>
            <optgroup label={isEs ? 'Próxima expansión nacional' : 'Upcoming national expansion'}>
              {upcomingCities.map((item) => (
                <option key={item.slug} value={item.slug} disabled>
                  {item.name}, {item.state} ({isEs ? 'Próximamente' : 'Coming soon'})
                </option>
              ))}
            </optgroup>
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
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <Button type="submit" size="lg" className="h-11 w-full lg:w-auto">
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
        <div className="mt-3 grid gap-2 border-t border-border/60 pt-3 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Label htmlFor="hero-sector">{isEs ? 'Sector en Cuenca' : 'Cuenca Sector'}</Label>
            <Select
              id="hero-sector"
              value={sector}
              onChange={(event) => setSector(event.target.value)}
            >
              <option value="">{isEs ? 'Todos los sectores' : 'All sectors'}</option>
              {cuencaSectors.map((s) => (
                <option key={s.slug} value={s.name}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="hero-max">{isEs ? 'Precio máximo ($)' : 'Max price'}</Label>
            <Input
              id="hero-max"
              type="number"
              placeholder={status === 'for-rent' ? '800' : '1,200,000'}
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
              placeholder="VS-001-AZUAY"
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
          </div>
        </div>
      ) : null}
    </form>
  );
}
