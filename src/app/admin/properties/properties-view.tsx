'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { getStatusLabel } from '@/lib/admin/labels';
import { formatPrice } from '@/lib/admin/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeletePropertyButton } from './delete-property-button';

interface PropertyItem {
  id: string;
  title: string;
  reference: string;
  status: string;
  featured: boolean;
  price: number;
  pricePeriod: 'MONTH' | 'TOTAL';
  agent: { name: string };
}

export function PropertiesView({ properties }: { properties: PropertyItem[] }) {
  const { t, isEs, language } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl text-headline tracking-tight">
          {t.admin?.properties ?? (isEs ? 'Propiedades' : 'Properties')}
        </h1>
        <Link href="/admin/properties/new">
          <Button>{t.admin?.newProperty ?? (isEs ? 'Nueva propiedad' : 'New property')}</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-normal">
                {t.admin?.property ?? (isEs ? 'Propiedad' : 'Property')}
              </th>
              <th className="px-4 py-3 font-normal">
                {t.admin?.status ?? (isEs ? 'Estado' : 'Status')}
              </th>
              <th className="px-4 py-3 font-normal">
                {t.admin?.price ?? (isEs ? 'Precio' : 'Price')}
              </th>
              <th className="px-4 py-3 font-normal">
                {t.admin?.agent ?? (isEs ? 'Agente' : 'Agent')}
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr
                key={property.id}
                className="border-b border-border last:border-0 hover:bg-muted/20"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/properties/${property.id}`}
                    className="font-medium hover:underline"
                  >
                    {property.title}
                  </Link>
                  <p className="font-mono text-xs text-muted-foreground">{property.reference}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{getStatusLabel(property.status, language)}</Badge>
                  {property.featured ? (
                    <Badge variant="brass" className="ml-1.5">
                      {t.admin?.featured ?? (isEs ? 'Destacada' : 'Featured')}
                    </Badge>
                  ) : null}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatPrice(property.price, property.pricePeriod)}
                </td>
                <td className="px-4 py-3">{property.agent.name}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/properties/${property.id}`}>
                      <Button variant="outline" size="sm">
                        {t.admin?.edit ?? (isEs ? 'Editar' : 'Edit')}
                      </Button>
                    </Link>
                    <DeletePropertyButton id={property.id} title={property.title} />
                  </div>
                </td>
              </tr>
            ))}
            {properties.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  {t.admin?.noPropertiesYet ??
                    (isEs ? 'Aún no hay propiedades registradas.' : 'No properties yet.')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
