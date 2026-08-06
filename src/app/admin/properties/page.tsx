import Link from 'next/link';
import { requireAgentOrAdmin } from '@/lib/session';
import * as propertiesCore from '@/lib/admin/properties';
import { STATUS_LABELS } from '@/lib/admin/labels';
import { formatPrice } from '@/lib/admin/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeletePropertyButton } from './delete-property-button';

export default async function AdminPropertiesPage() {
  const actor = await requireAgentOrAdmin();
  const properties = await propertiesCore.listProperties(actor);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-headline text-2xl">Properties</h1>
        <Link href="/admin/properties/new">
          <Button>New property</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-normal">Property</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Price</th>
              <th className="px-4 py-3 font-normal">Agent</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/properties/${property.id}`} className="font-medium hover:underline">
                    {property.title}
                  </Link>
                  <p className="font-mono text-xs text-muted-foreground">{property.reference}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{STATUS_LABELS[property.status] ?? property.status}</Badge>
                  {property.featured ? (
                    <Badge variant="brass" className="ml-1.5">
                      Featured
                    </Badge>
                  ) : null}
                </td>
                <td className="px-4 py-3 tabular-nums">{formatPrice(property.price, property.pricePeriod)}</td>
                <td className="px-4 py-3">{property.agent.name}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/properties/${property.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
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
                  No properties yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
